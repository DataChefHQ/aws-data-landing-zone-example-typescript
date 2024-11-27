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
  budgets: [
    ...Defaults.budgets(100, 20, {}),
  ],
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
};