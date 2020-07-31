import { rename } from './commands';

rename(process.env['KUBECONFIG'] || 'C:\\Users\\kbirger\\.kube\\config', 'context', 'OIK8CL02-context', 'OPEN-INT-2', true);

console.log('hi');