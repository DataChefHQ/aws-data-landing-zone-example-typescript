import {
    DatabaseAction,
    DataLandingZoneProps,
    Defaults,
    DlzAccountType,
    DlzControlTowerStandardControls,
    DlzVpcProps,
    NetworkAddress,
    Region,
    SecurityHubNotificationSeverity,
    SecurityHubNotificationSWorkflowStatus,
    SlackChannel,
    TableAction,
    TagAction
  } from '@DataChefHQ/data-landing-zone';
  import { aws_ec2 as ec2, aws_iam as iam } from 'aws-cdk-lib';
  
  const slackBudgetNotifications: SlackChannel = {
    slackChannelConfigurationName: 'budget-alerts',
    slackWorkspaceId: 'YourWorkspaceId:',
    slackChannelId: 'YourChannelId',
  };
  
  export const config: DataLandingZoneProps = {
    localProfile: 'ct-sandbox-exported',
    regions: {
      global: Region.EU_WEST_1,
      regional: [Region.US_EAST_1],
    },
    mandatoryTags: {
      owner: ['backend'],
      project: ['accounting'],
      environment: ['development', 'staging', 'production'],
    },
    defaultNotification: {
      slack: {
        slackChannelConfigurationName: 'new-channel-default-notifications',
        slackWorkspaceId: 'YourWorkspaceId',
        slackChannelId: 'YourChannelId',
      },
    },
    budgets: [
      ...Defaults.budgets(100, 20, {
        slack: slackBudgetNotifications,
        emails: ['you@org.com'],
      }),
      {
        name: 'backend',
        forTags: {
          owner: 'backend',
        },
        amount: 100,
        subscribers: {
          slack: slackBudgetNotifications,
          emails: ['you@org.com'],
        },
      },
      {
        name: 'backend-accounting-internal-development',
        forTags: {
          owner: 'backend',
          project: 'accounting-internal',
          environment: 'development',
        },
        amount: 100,
        subscribers: {
          slack: slackBudgetNotifications,
          emails: [
            'you@org.com',
          ],
        },
      },
    ],
    securityHubNotifications: [
      {
        id: 'notify-high',
        severity: [
          SecurityHubNotificationSeverity.MEDIUM,
          SecurityHubNotificationSeverity.HIGH,
          SecurityHubNotificationSeverity.CRITICAL,
        ],
        workflowStatus: [SecurityHubNotificationSWorkflowStatus.NEW],
        notification: {
          slack: {
            slackChannelConfigurationName: 'security-hub-high',
            slackWorkspaceId: 'YourWordspaceID',
            slackChannelId: 'YourChannelID',
          },
        },
      },
      {
        id: 'notify-resolved',
        workflowStatus: [
          SecurityHubNotificationSWorkflowStatus.RESOLVED,
          SecurityHubNotificationSWorkflowStatus.SUPPRESSED,
        ],
        notification: {
            slack: {
                slackChannelConfigurationName: 'security-hub-resolved',
                slackWorkspaceId: 'YourWordspaceID',
                slackChannelId: 'YourChannelID',
             },
        },
      },
    ],
    organization: {
      organizationId: 'OrganizationID',
      root: {
        accounts: {
          management: {
            accountId: 'YourRootAccountID',
          },
        },
        /* Optional, showing that controls can be changed, added or removed from the default
         * These controls are applied to all the OUs in the org */
        controls: [
          ...Defaults.rootControls(),
          DlzControlTowerStandardControls.SH_SECRETS_MANAGER_3,
        ],
      },
      ous: {
        security: {
          ouId: 'RootOrganizationID',
          accounts: {
            log: {
              accountId: 'YourLogsAccountID',
            },
            audit: {
              accountId: 'YourAuditAccountID',
            },
          },
        },
        workloads: {
          ouId: 'WorkloadOrganizationUnitId',
  
          accounts: [
            {
              name: 'development',
              accountId: 'YourDevelopmentAccountID',
              type: DlzAccountType.DEVELOP,
              vpcs: [
                Defaults.vpcClassB3Private3Public(0, Region.US_EAST_1),
                Defaults.vpcClassB3Private3Public(1, Region.EU_WEST_1),
              ],
            },
            {
              name: 'production',
              accountId: 'YourProductionAccountID',
              type: DlzAccountType.PRODUCTION,
              vpcs: [
                Defaults.vpcClassB3Private3Public(2, Region.US_EAST_1),
                Defaults.vpcClassB3Private3Public(3, Region.EU_WEST_1),
              ],
              lakeFormation: [{
                region: Region.EU_WEST_1,
                admins: ['arn:aws:iam::YourProductionAccountID:role/aws-reserved/sso.amazonaws.com/eu-west-1/AWSReservedSSO_AdministratorAccess_edcdcd01206c378d'],
                hybridMode: true,
                tags: [
                  { tagKey: 'common', tagValues: ['true', 'false'] },
                  { tagKey: 'team:Data', tagValues: ['true'] },
                  { tagKey: 'team:DevOps', tagValues: ['true'] },
                  {
                    tagKey: 'shared', tagValues: ['true', 'false'], share: {
                      withExternalAccount: [{
                        principals: ['YourDevelopmentAccountID'],
                        tagActions: [TagAction.DESCRIBE, TagAction.ASSOCIATE],
                        tagActionsWithGrant: [TagAction.DESCRIBE, TagAction.ASSOCIATE],
                        specificValues: ['true']
                      }]
                    }
                  },
                ],
                permissions: [
                  {
                    principals: ['arn:aws:iam::YourProductionAccountID:role/TeamData', 'arn:aws:iam::YourProductionAccountID:role/TeamDevOps'],
                    tags: [{ tagKey: 'common', tagValues: ['true'] }],
                    databaseActions: [DatabaseAction.DESCRIBE],
                    tableActions: [TableAction.DESCRIBE, TableAction.SELECT]
                  },
                  {
                    principals: ['arn:aws:iam::YourProductionAccountID:role/TeamData'],
                    tags: [{ tagKey: 'team:Data', tagValues: ['true'] }],
                    databaseActions: [DatabaseAction.DESCRIBE],
                    tableActions: [TableAction.DESCRIBE, TableAction.SELECT]
                  },
                  {
                    principals: ['arn:aws:iam::YourProductionAccountID:role/TeamDevOps'],
                    tags: [{ tagKey: 'team:DevOps', tagValues: ['true'] }],
                    databaseActions: [DatabaseAction.DESCRIBE, DatabaseAction.CREATE_TABLE, DatabaseAction.ALTER, DatabaseAction.DROP],
                    tableActions: [TableAction.DESCRIBE, TableAction.SELECT, TableAction.ALTER, TableAction.DELETE, TableAction.INSERT, TableAction.DROP],
                    databaseActionsWithGrant: [DatabaseAction.DESCRIBE, DatabaseAction.CREATE_TABLE, DatabaseAction.ALTER, DatabaseAction.DROP],
                    tableActionsWithGrant: [TableAction.DESCRIBE, TableAction.SELECT, TableAction.ALTER, TableAction.DELETE, TableAction.INSERT, TableAction.DROP]
                  },
                  {
                    principals: ['YourDevelopmentAccountID'],
                    tags: [{ tagKey: 'shared', tagValues: ['true'] }],
                    databaseActions: [DatabaseAction.DESCRIBE],
                    tableActions: [TableAction.DESCRIBE, TableAction.SELECT]
                  },
                ],
              }],
            },
          ],
        },
        suspended: {
          ouId: '',
        },
      },
    },
    network: {
      connections: {
        vpcPeering: [
          {
            // source: new NetworkAddress('development', Region.EU_WEST_1, 'default', 'private'),
            source: new NetworkAddress('development'),
            destination: NetworkAddress.fromString(
              'production.us-east-1.default.private'
            ),
            // source: new NetworkAddress('development'),
            // destination: new NetworkAddress('production'),
          },
        ],
      },
      nats: [
        /* One NAT Instance that routes all traffic from the private route table and it's subnets  */
        {
          name: 'development-eu-west-1-internet-access',
          location: new NetworkAddress('development', Region.EU_WEST_1, 'default', 'public', 'public-1'),
          allowAccessFrom: [
            new NetworkAddress('development', Region.EU_WEST_1, 'default', 'private'),
          ],
          type: {
            instance: {
              instanceType: ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.MICRO),
            },
          },
        },
      //
      //   /* The same as above but for the production account that uses a NAT GW */
      //   {
      //     name: 'production-eu-west-1-internet-access',
      //     location: new NetworkAddress('production', Region.EU_WEST_1, 'default', 'public', 'public-1'),
      //     allowAccessFrom: [
      //       new NetworkAddress('production', Region.EU_WEST_1, 'default', 'private'),
      //     ],
      //     type: {
      //       gateway: {
      //         // eip: {
      //         //   tags: [{key: 'Extra', value: "cool"}],
      //         // }
      //       },
      //     },
      //   },
      ],
      bastionHosts: [
        {
          name: 'default', // can this be optional, defaults to 'default', would be unique in stack, but not app.
          location: new NetworkAddress('development', Region.EU_WEST_1, 'default', 'private', 'private-1'), //if the name does not match error, validation begin also handle comment above
          instanceType: ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.MICRO),
        }
      ]
    },
    iamPolicyPermissionBoundary: {
        policyStatement: {
        effect: iam.Effect.ALLOW,
        actions: ['*'],
        resources: ['*'],
        },
    },
    iamIdentityCenter: {
      arn: 'IdentityCenterARN',
      id: 'IdentityCenterID',
      storeId: 'StoreID',
      users: [
        {
          userName: 'you@org.com',
          name: 'Name',
          surname: 'LastName',
        },
      ],
      permissionSets: [
        // Provides the AWS managed policy `AdministratorAccess` and `ReadOnlyAccess` as permission sets
        ...Defaults.iamIdentityCenterPermissionSets(),
  
        // Can create custom permission sets from managed policies
        // {
        //   name: 'admin-access-permission-set',
        //   managedPolicyArns: ['arn:aws:iam::aws:policy/AdministratorAccess']
        // },
  
        // Can create custom permission sets from inline policies
        // {
        //   name: 's3-only-access',
        //   inlinePolicyStatement: new iam.PolicyStatement({
        //     actions: ['s3:*'],
        //     resources: ['*'],
        //   })
        // }
      ],
      accessGroups: [
        {
          name: 'admin-access-group',
          accountNames: ['*'],
          // accountNames: ['project-1-*'],
          // accountNames: ['root', 'development', 'production'],
          userNames: [
            'you@org.com',
          ],
          permissionSetName: 'AdministratorAccess',
        },
      ],
    },
  
    /* Optional, showing that additional tags can be made mandatory */
    additionalMandatoryTags: [
      { name: 'Test' }
    ],
    /* Optional, showing that the deny list can be changed, added or removed from the default */
    denyServiceList: [
      ...Defaults.denyServiceList(),
      "ecs:*"
    ],
    deploymentPlatform: {
      gitHub: {
        references: [
          {
            owner: 'DataChefHQ',
            repo: 'data-landing-zone-example-typescript',
          },
        ],
      },
    },
    printReport: false,
    printDeploymentOrder: true,
  };