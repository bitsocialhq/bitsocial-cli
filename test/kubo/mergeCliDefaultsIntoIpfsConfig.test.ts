import { expect } from "chai";
import { file as tempFile } from "tempy";
import * as fs from "fs/promises";
import path from "path";
import { mergeCliDefaultsIntoIpfsConfig } from "../../src/ipfs/startIpfs.js";

const noopLog = () => {
    /* no-op for tests */
};

const writeConfigToTempFile = async (config: Record<string, any>) => {
    const filepath = tempFile({ name: "ipfs-config.json" });
    await fs.mkdir(path.dirname(filepath), { recursive: true });
    await fs.writeFile(filepath, JSON.stringify(config, null, 2), "utf-8");
    return filepath;
};

describe("mergeCliDefaultsIntoIpfsConfig", () => {
    it("overrides core defaults on freshly initialized config", async () => {
        const initialConfig = {
            Addresses: {
                Swarm: ["/ip4/0.0.0.0/tcp/4001"],
                Gateway: "/ip4/0.0.0.0/tcp/8080"
            }
        };
        const configPath = await writeConfigToTempFile(initialConfig);

        await mergeCliDefaultsIntoIpfsConfig(noopLog, configPath, new URL("http://127.0.0.1:5001"), new URL("http://127.0.0.1:8080"));

        const mergedConfig = JSON.parse(await fs.readFile(configPath, "utf-8"));
        expect(mergedConfig.Addresses.API).to.equal("/ip4/127.0.0.1/tcp/5001");
        expect(mergedConfig.Addresses.Gateway).to.equal("/ip4/127.0.0.1/tcp/8080");
        expect(mergedConfig.AutoTLS.Enabled).to.be.true;
    });

    it("preserves user configured gateway settings while disabling subdomain redirects", async () => {
        const initialConfig = {
            Gateway: {
                NoFetch: true,
                PublicGateways: {
                    "example.com": {
                        Paths: ["/ipfs"],
                        UseSubdomains: true
                    }
                }
            }
        };
        const configPath = await writeConfigToTempFile(initialConfig);

        await mergeCliDefaultsIntoIpfsConfig(noopLog, configPath, new URL("http://10.0.0.2:4001"), new URL("http://10.0.0.2:8081"));

        const mergedConfig = JSON.parse(await fs.readFile(configPath, "utf-8"));
        expect(mergedConfig.Gateway.NoFetch).to.be.true;

        const exampleGateway = mergedConfig.Gateway.PublicGateways["example.com"];
        expect(exampleGateway.Paths).to.deep.equal(["/ipfs"]);
        expect(exampleGateway.UseSubdomains).to.be.false;
    });

    it("adds gateway entries for target hostnames and keeps existing metadata", async () => {
        const initialConfig = {
            Gateway: {
                PublicGateways: {
                    localhost: {
                        Paths: ["/ipns"],
                        InlineDNSLink: true,
                        UseSubdomains: true
                    }
                }
            }
        };
        const configPath = await writeConfigToTempFile(initialConfig);

        await mergeCliDefaultsIntoIpfsConfig(noopLog, configPath, new URL("http://192.168.1.5:5001"), new URL("http://custom.host:8080"));

        const mergedConfig = JSON.parse(await fs.readFile(configPath, "utf-8"));
        const localhostGateway = mergedConfig.Gateway.PublicGateways["localhost"];
        expect(localhostGateway.Paths).to.deep.equal(["/ipns"]);
        expect(localhostGateway.InlineDNSLink).to.be.true;
        expect(localhostGateway.UseSubdomains).to.be.false;

        expect(mergedConfig.Gateway.PublicGateways["custom.host"]).to.include({ UseSubdomains: false });
        expect(mergedConfig.Gateway.PublicGateways["127.0.0.1"]).to.include({ UseSubdomains: false });
    });
});
