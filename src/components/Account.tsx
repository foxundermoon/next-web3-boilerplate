import MetaMaskOnboarding from '@metamask/onboarding';
import { useWeb3React } from '@web3-react/core';
import { UserRejectedRequestError } from '@web3-react/injected-connector';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { injected } from '~/src/connectors';
import useENSName from '~/src/hooks/useENSName';
import { formatEtherscanLink, shortenHex } from '~/src/util';
import { Button } from '@material-ui/core';
import Link from '~/src/components/link';

type Props = {
  triedToEagerConnect: boolean;
};

const Account = ({ triedToEagerConnect }: Props) => {
  const { active, error, activate, chainId, account, setError } = useWeb3React();

  // initialize metamask onboarding
  const onboarding = useRef<MetaMaskOnboarding>();

  useLayoutEffect(() => {
    onboarding.current = new MetaMaskOnboarding();
  }, []);

  // manage connecting state for injected connector
  const [connecting, setConnecting] = useState(false);
  useEffect(() => {
    if (active || error) {
      setConnecting(false);
      onboarding.current?.stopOnboarding();
    }
  }, [active, error]);

  const ENSName = useENSName(account);

  if (error) {
    return null;
  }

  if (!triedToEagerConnect) {
    return null;
  }

  if (typeof account !== 'string') {
    const hasMetaMaskOrWeb3Available =
      MetaMaskOnboarding.isMetaMaskInstalled() || (window as any)?.ethereum || (window as any)?.web3;

    return (
      <div>
        {hasMetaMaskOrWeb3Available ? (
          <Button
            onClick={() => {
              setConnecting(true);

              activate(injected, undefined, true).catch((error) => {
                // ignore the error if it's a user rejected request
                if (error instanceof UserRejectedRequestError) {
                  setConnecting(false);
                } else {
                  setError(error);
                }
              });
            }}
          >
            {MetaMaskOnboarding.isMetaMaskInstalled() ? 'Connect to MetaMask' : 'Connect to Wallet'}
          </Button>
        ) : (
          <Button onClick={() => onboarding.current?.startOnboarding()}>Install Metamask</Button>
        )}
      </div>
    );
  }

  return (
    <Link
      {...{
        href: formatEtherscanLink('Account', [chainId, account]),
        target: '_blank',
        rel: 'noopener noreferrer',
      }}
    >
      {ENSName || `${shortenHex(account, 4)}`}
    </Link>
  );
};

export default Account;
