/* eslint-disable no-await-in-loop */
const { isEmpty, isNil } = require('lodash');
const importProviders = require('./bulk/providers');

async function initProviders() {
  try {
    const providers = await importProviders();
    const storageProvider = 'leebrary-aws-s3';
    const emailProvider = 'emails-amazon-ses';
    const smtpEmailProvider = 'emails-smtp';

    // ·····································
    // STORAGE PROVIDER
    if (
      providers.storage &&
      providers.storage.provider === storageProvider &&
      !isEmpty(providers.storage.accessKey) &&
      !isEmpty(providers.storage.secretAccessKey)
    ) {
      const storageConfig = {
        bucket: providers.storage.bucket,
        region: providers.storage.region || 'eu-central-1',
        accessKey: providers.storage.accessKey,
        secretAccessKey: providers.storage.secretAccessKey,
      };

      await leemons
        .getPlugin('leebrary')
        .services.settings.setProviderConfig(storageProvider, storageConfig);
    }

    // ·····································
    // EMAIL PROVIDER
    if (
      providers.email &&
      providers.email.provider === emailProvider &&
      !isEmpty(providers.email.accessKey) &&
      !isEmpty(providers.email.secretAccessKey)
    ) {
      const emailConfig = {
        name: providers.email.name,
        region: providers.email.region || 'eu-central-1',
        accessKey: providers.email.accessKey,
        secretAccessKey: providers.email.secretAccessKey,
      };

      await leemons
        .getPlugin('emails')
        .services.email.addProvider({ providerName: emailProvider, config: emailConfig });

      /*
      await leemons.getPlugin('emails').services.email.addProvider({
        providerName: 'emails-smtp',
        config: {
          name: providers.email.name,
          host: providers.email.host,
          port: providers.email.port || 25,
          secure: providers.email.secure || false,
          user: providers.email.user,
          pass: providers.email.pass,
        },
      });
      */
    }

    if (
      providers.email &&
      providers.email.provider === smtpEmailProvider &&
      !isNil(providers.email.smtpPort) &&
      !isEmpty(providers.email.smtpHost) &&
      !isEmpty(providers.email.smtpUser)
    ) {
      const emailConfig = {
        name: providers.email.name,
        secure: providers.email.smtpSecure ?? false,
        port: providers.email.smtpPort ?? 25,
        host: providers.email.smtpHost,
        user: providers.email.smtpUser,
        pass: providers.email.smtpPass,
      };

      await leemons
        .getPlugin('emails')
        .services.email.addProvider({ providerName: smtpEmailProvider, config: emailConfig });
    }

    return providers;
  } catch (err) {
    console.error(err);
  }

  return null;
}

module.exports = initProviders;
