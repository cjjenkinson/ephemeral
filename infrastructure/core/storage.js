const cdk = require('@aws-cdk/core');
const s3 = require('@aws-cdk/aws-s3');

class Storage extends cdk.Stack {
  constructor(app, id, { stage, serviceName }) {
    super(app, id);

    const userAssetsBucket = new s3.Bucket(this, 'UserAssetsBucket', {
      versioned: false,
      bucketName: `truman-${stage}-${serviceName}-user-assets`,
      publicReadAccess: false,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      // TODO - what does this mean?
      lifecycleRules: [
        {
          expiration: cdk.Duration.days(365),
          transitions: [
            {
              storageClass: s3.StorageClass.INFREQUENT_ACCESS,
              transitionAfter: cdk.Duration.days(60),
            },
          ],
        },
      ],
    });

    const audioUploadsBucket = new s3.Bucket(this, 'SubmissionAudioBucket', {
      versioned: false,
      bucketName: `truman-${stage}-${serviceName}-submission-audio`,
      publicReadAccess: false,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      accelerationStatus: 'Enabled',
    });

    // for production use trackstack.in as only origin
    const cfnBucket = audioUploadsBucket.node.findChild('Resource');
    cfnBucket.addPropertyOverride('CorsConfiguration', {
      CorsRules: [
        {
          AllowedOrigins: ['*'],
          AllowedMethods: ['GET', 'POST'],
        },
      ],
    });

    this.buckets = {
      userAssetsBucket,
      audioUploadsBucket
    }
  }

  getBuckets() {
    return this.buckets
  }
}

module.exports = { Storage };
