import { useCallback, useState, useEffect } from 'react';
import { ConfigAppSDK } from '@contentful/app-sdk';
import { Heading, Form, Paragraph, Flex, FormControl, TextInput } from '@contentful/f36-components';
import { css } from 'emotion';
import { useSDK } from '@contentful/react-apps-toolkit';

export interface AppInstallationParameters {
  storeHash?: string;
  accessToken?: string;
}

const ConfigScreen = () => {
  const [parameters, setParameters] = useState<AppInstallationParameters>({});
  const sdk = useSDK<ConfigAppSDK>();
  /*
     To use the cma, access it as follows.
     If it is not needed, you can remove the next line.
  */
  // const cma = sdk.cma;

  const onConfigure = useCallback(async () => {
    // This method will be called when a user clicks on "Install"
    // or "Save" in the configuration screen.
    // for more details see https://www.contentful.com/developers/docs/extensibility/ui-extensions/sdk-reference/#register-an-app-configuration-hook

    // Get current the state of EditorInterface and other entities
    // related to this app installation
    const currentState = await sdk.app.getCurrentState();

    return {
      // Parameters to be persisted as the app configuration.
      parameters,
      // In case you don't want to submit any update to app
      // locations, you can just pass the currentState as is
      targetState: currentState,
    };
  }, [parameters, sdk]);

  useEffect(() => {
    // `onConfigure` allows to configure a callback to be
    // invoked when a user attempts to install the app or update
    // its configuration.
    sdk.app.onConfigure(() => onConfigure());
  }, [sdk, onConfigure]);

  useEffect(() => {
    (async () => {
      // Get current parameters of the app.
      // If the app is not installed yet, `parameters` will be `null`.
      const currentParameters: AppInstallationParameters | null = await sdk.app.getParameters();

      if (currentParameters) {
        setParameters(currentParameters);
      }

      // Once preparation has finished, call `setReady` to hide
      // the loading screen and present the app to a user.
      sdk.app.setReady();
    })();
  }, [sdk]);

  return (
    <Flex flexDirection="column" className={css({ margin: '80px', maxWidth: '800px' })}>
      <Form>
        <Heading>BigCommerce Variant Picker Configuration</Heading>
        <Paragraph>
          Configure your BigCommerce store credentials to enable variant selection.
        </Paragraph>

        <FormControl isRequired>
          <FormControl.Label>Store Hash</FormControl.Label>
          <TextInput
            value={parameters.storeHash || ''}
            onChange={(e) => setParameters({ ...parameters, storeHash: e.target.value })}
            placeholder="Enter your BigCommerce Store Hash"
          />
          <FormControl.HelpText>
            Your store hash can be found in your BigCommerce store URL
          </FormControl.HelpText>
        </FormControl>

        <FormControl isRequired>
          <FormControl.Label>Access Token</FormControl.Label>
          <TextInput
            value={parameters.accessToken || ''}
            type="password"
            onChange={(e) => setParameters({ ...parameters, accessToken: e.target.value })}
            placeholder="Enter your BigCommerce Access Token"
          />
          <FormControl.HelpText>
            Generate an API token with read access to products in your BigCommerce store
          </FormControl.HelpText>
        </FormControl>
      </Form>
    </Flex>
  );
};

export default ConfigScreen;
