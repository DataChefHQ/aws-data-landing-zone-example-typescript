import { Scripts } from 'aws-data-landing-zone';
import { config } from '../bin/minimum_config';

(async () => {
  await (new Scripts()).diffSelect(config, '*_development--*_*');
})();