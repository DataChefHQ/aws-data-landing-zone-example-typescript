import {
  DataLandingZoneProps,
  Defaults,
  DlzAccountType,
  DlzControlTowerStandardControls,
  Region,
} from '@DataChefHQ/data-landing-zone';


export const config: DataLandingZoneProps = {
  localProfile: '', // TODO: Not required; Will be optional from next release
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
  },
  budgets: [],
  securityHubNotifications: [
  ],
  organization: {
    organizationId: 'o-05ev6vk6fa',
    root: {
      accounts: {
        management: {
          accountId: '882070149987',
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
        ouId: 'ou-vh4d-lpyovlyp',
        accounts: {
          log: {
            accountId: '730335597466',
          },
          audit: {
            accountId: '851725452335',
          },
        },
      },
      workloads: {
        ouId: 'ou-vh4d-nc2zzf9z',

        // Small Org, all workloads/projects in the same accounts
        accounts: [
          {
            name: 'development',
            accountId: '891377166347',
            type: DlzAccountType.DEVELOP,
          },
        ],
      },
      suspended: {
        ouId: 'ou-vh4d-rhcmhzsy',
      },
    },
  },
  network: {
    connections: {
      vpcPeering: [
      ],
    },
  },
  iamIdentityCenter: {
    arn: 'arn:aws:sso:::instance/ssoins-6804a208616635a6',
    id: 'ssoins-6804a208616635a6',
    storeId: 'd-936746b442',
    users: [
      {
        userName: 'farbod@datachef.co',
        name: 'Farbod',
        surname: 'Ahmadian',
      },
    ],
    permissionSets: [
      // Provides the AWS managed policy `AdministratorAccess` and `ReadOnlyAccess` as permission sets
      ...Defaults.iamIdentityCenterPermissionSets(),
    ],
    accessGroups: [
      {
        name: 'admin-access-group',
        accountNames: ['*'],
        userNames: [
          'farbod@datachef.co',
        ],
        permissionSetName: 'AdministratorAccess',
      },
    ],
  },
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