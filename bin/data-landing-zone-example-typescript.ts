#!/usr/bin/env node
import {App} from 'aws-cdk-lib';
import {config} from "./minimum_config";
import * as sns from 'aws-cdk-lib/aws-sns';
import { DataLandingZone } from '@DataChefHQ/data-landing-zone';

const app = new App();
const dlz = new DataLandingZone(app, config)

// Extend an existing stack's resources
const topic = new sns.Topic(dlz.managementStack, "manual-topic", {
  displayName: "manual-topic",
  topicName: "manual-topic",
});