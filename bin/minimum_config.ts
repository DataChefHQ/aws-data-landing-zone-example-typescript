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
    organizationId: 'RootOrganizationID',
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
        ouId: 'SecurityOrganizationUnitId',
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

        // Small Org, all workloads/projects in the same accounts
        accounts: [
          {
            name: 'development',
            accountId: 'YourDevelopmentAccountID',
            type: DlzAccountType.DEVELOP,
          },
        ],
      },
      suspended: {
        ouId: 'SuspendedOrganizationUnitId',
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