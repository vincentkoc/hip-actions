import  { SonarCloudClient } from './sonar';

const core = {
    getInput(name: string, options: { required?: boolean } = {}): string {
        const envName = `INPUT_${name.replace(/ /g, '_').toUpperCase()}`;
        const value = process.env[envName] || '';
        if (options.required && !value) {
            throw new Error(`Input required and not supplied: ${name}`);
        }
        return value;
    },
    info(message: string): void {
        console.log(message);
    },
    setFailed(error: unknown): void {
        process.exitCode = 1;
        console.error(error instanceof Error ? error.message : error);
    },
};

const repo = <string> process.env.CI_REPOSITORY_NAME;
const owner = <string> process.env.CI_REPOSITORY_OWNER;
const token = core.getInput('sonar_token', { required: true });

const defaultMasterBranch = "master";
const client = new SonarCloudClient(owner, token);

try {
    core.info(`Setting up SonarCloud for repository: ${repo}`);
    client.register(repo, defaultMasterBranch);
    core.info('SonarCloud setup completed!');
} catch (error) {
    core.setFailed(error);
}
