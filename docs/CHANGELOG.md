

## [0.11.13](https://github.com/plebbit/plebbit-cli/compare/v0.11.12...v0.11.13) (2024-03-04)

## [0.11.12](https://github.com/plebbit/plebbit-cli/compare/v0.11.11...v0.11.12) (2024-03-02)


### Bug Fixes

* **install:** relative argument not needed ([80e9a83](https://github.com/plebbit/plebbit-cli/commit/80e9a831e0c9a3b364dccf2bc2cc5f43bbf706df))

## [0.11.11](https://github.com/plebbit/plebbit-cli/compare/v0.11.10...v0.11.11) (2024-02-18)

## [0.11.10](https://github.com/plebbit/plebbit-cli/compare/v0.11.9...v0.11.10) (2024-02-18)

## [0.11.9](https://github.com/plebbit/plebbit-cli/compare/v0.11.8...v0.11.9) (2024-02-18)


### Bug Fixes

* remove fs-extra, not needed ([9754233](https://github.com/plebbit/plebbit-cli/commit/9754233b275f341354c4a47a0dca2d1544f0da30))

## [0.11.8](https://github.com/plebbit/plebbit-cli/compare/v0.11.7...v0.11.8) (2024-02-17)

## [0.11.7](https://github.com/plebbit/plebbit-cli/compare/v0.11.6...v0.11.7) (2024-02-17)

## [0.11.6](https://github.com/plebbit/plebbit-cli/compare/v0.11.5...v0.11.6) (2024-02-17)

## [0.11.5](https://github.com/plebbit/plebbit-cli/compare/v0.11.4...v0.11.5) (2024-02-17)

## [0.11.4](https://github.com/plebbit/plebbit-cli/compare/v0.11.3...v0.11.4) (2024-02-17)

## [0.11.3](https://github.com/plebbit/plebbit-cli/compare/v0.11.2...v0.11.3) (2024-02-17)

## [0.11.2](https://github.com/plebbit/plebbit-cli/compare/v0.11.1...v0.11.2) (2024-02-17)


### Bug Fixes

* fix import errors caused by plebbit-js going ESM only ([76b2407](https://github.com/plebbit/plebbit-cli/commit/76b24076f50228e35117ba3bddad16d3af2ce8b3))

## [0.11.1](https://github.com/plebbit/plebbit-cli/compare/v0.11.0...v0.11.1) (2024-01-03)

# [0.11.0](https://github.com/plebbit/plebbit-cli/compare/v0.10.2...v0.11.0) (2023-12-31)


### Features

* **daemon:** plebbit daemon will use ipfs API instead of starting a new daemon if api port is used ([7c8a1c1](https://github.com/plebbit/plebbit-cli/commit/7c8a1c1c5d336a5ce45f53ea0a8deaa0590f39b0))

## [0.10.2](https://github.com/plebbit/plebbit-cli/compare/v0.10.1...v0.10.2) (2023-12-11)

## [0.10.1](https://github.com/plebbit/plebbit-cli/compare/v0.10.0...v0.10.1) (2023-12-09)

# [0.10.0](https://github.com/plebbit/plebbit-cli/compare/v0.9.6...v0.10.0) (2023-12-05)


### Features

* **daemon:** add rpc auth key to plebbit rpc ([79fa920](https://github.com/plebbit/plebbit-cli/commit/79fa9204c408d50a10bc0e8b979c9e8aefb081bf))

## [0.9.6](https://github.com/plebbit/plebbit-cli/compare/v0.9.5...v0.9.6) (2023-11-24)

## [0.9.5](https://github.com/plebbit/plebbit-cli/compare/v0.9.4...v0.9.5) (2023-11-24)

## [0.9.4](https://github.com/plebbit/plebbit-cli/compare/v0.9.3...v0.9.4) (2023-11-22)

## [0.9.3](https://github.com/plebbit/plebbit-cli/compare/v0.9.2...v0.9.3) (2023-11-18)

## [0.9.2](https://github.com/plebbit/plebbit-cli/compare/v0.9.1...v0.9.2) (2023-11-18)


### Bug Fixes

* **list:** make sure plebbit is destroyed ([f04c1a1](https://github.com/plebbit/plebbit-cli/commit/f04c1a1d6afe91ef2c500abdbd90734c76e89623))

## [0.9.1](https://github.com/plebbit/plebbit-cli/compare/v0.9.0...v0.9.1) (2023-11-18)

# [0.9.0](https://github.com/plebbit/plebbit-cli/compare/v0.8.2...v0.9.0) (2023-11-18)


### Features

* **create:** implement dynamic flags for subplebbit create ([c3e33d8](https://github.com/plebbit/plebbit-cli/commit/c3e33d831896739f0580cd67c9af1eb42744dd8b))
* **edit:** implement dynamic flags for editing a subplebbit ([3c3c9c5](https://github.com/plebbit/plebbit-cli/commit/3c3c9c5a32a9f827cb48280298d58ca45de10505))

## [0.8.2](https://github.com/plebbit/plebbit-cli/compare/v0.8.1...v0.8.2) (2023-11-13)


### Bug Fixes

* **daemon:** fix rpc import problem with daemon command ([5cadece](https://github.com/plebbit/plebbit-cli/commit/5cadece48aeef12ba64d68781332c6590460bf17))

## [0.8.1](https://github.com/plebbit/plebbit-cli/compare/v0.8.0...v0.8.1) (2023-11-13)

# [0.8.0](https://github.com/plebbit/plebbit-cli/compare/v0.7.15...v0.8.0) (2023-11-13)


### Bug Fixes

* **cli:** make sure websocket connection is closed down after cli command ([5b7a3a7](https://github.com/plebbit/plebbit-cli/commit/5b7a3a7637846783020e3ebd264a5dcf32d6d369))
* **cli:** no need to fetch startedState if -q is used ([26d3ee6](https://github.com/plebbit/plebbit-cli/commit/26d3ee6ed6502d5f3b90b2d740c2fab428753fd6))
* **daemon:** corrected printed gateway url ([1d722a9](https://github.com/plebbit/plebbit-cli/commit/1d722a9c97c0e40753e25704b138c70c0e69bcdb))
* **daemon:** make sure rpc server is destroyed when process is exited ([34d1b8d](https://github.com/plebbit/plebbit-cli/commit/34d1b8da89592f0863a7ab780e3b08f8058cff7c))
* **seeder:** comment out seeding functionality for now ([a566152](https://github.com/plebbit/plebbit-cli/commit/a56615242dc7a533dab8ac6cef108de8a41a9a4c))


### Features

* **ci:** to force a new release ([e7405a1](https://github.com/plebbit/plebbit-cli/commit/e7405a19a1d94b4296d43842f29d184cc157e1ac))
* **ci:** to trigger a new release ([aa6c5a9](https://github.com/plebbit/plebbit-cli/commit/aa6c5a93489b3fd08b75ab8a699fca2ebb282afa))

* build(deps): upgrade plebbit-js and kubo and remove unneeded code (3c9fd7c)
* fix(daemon): make sure rpc server is destroyed when process is exited (34d1b8d)
* fix(cli): make sure websocket connection is closed down after cli command (5b7a3a7)
* fix(daemon): corrected printed gateway url (1d722a9)
* test(cli): fix tests and CI (2230bc8)
* style(cli): clearer messages (cdaedc9)
* fix(cli): no need to fetch startedState if -q is used (26d3ee6)
* test(create): migrate cli create command to latest plebbit-cli (418e3b3)
* refactor(cli): migrate the CLI codebase to plebbit-js with rpc. HTTP API not needed anymore (39dc54f)
* build(deps): upgrade deps including plebbit-js (a7f5ec8)
* fix(seeder): comment out seeding functionality for now (a566152)
* Delete plebwhales.eth (e1f1ca3)
* Update README.md (9075efa)
* build(packaging): ci build (45d10a3)

## [0.7.16](https://github.com/plebbit/plebbit-cli/compare/v0.7.15...v0.7.16) (2023-08-31)

## [0.7.15](https://github.com/plebbit/plebbit-cli/compare/v0.7.14...v0.7.15) (2023-08-30)

## [0.7.14](https://github.com/plebbit/plebbit-cli/compare/v0.7.13...v0.7.14) (2023-08-29)

## [0.7.13](https://github.com/plebbit/plebbit-cli/compare/v0.7.12...v0.7.13) (2023-08-27)

## [0.7.12](https://github.com/plebbit/plebbit-cli/compare/v0.7.11...v0.7.12) (2023-08-23)

## [0.7.11](https://github.com/plebbit/plebbit-cli/compare/v0.7.10...v0.7.11) (2023-08-22)

## [0.7.10](https://github.com/plebbit/plebbit-cli/compare/v0.7.9...v0.7.10) (2023-08-22)


### Bug Fixes

* **api:** add error event handler for Plebbit ([4524984](https://github.com/plebbit/plebbit-cli/commit/45249842d16da3677ba94054c67c01614cdcabf0))

## [0.7.9](https://github.com/plebbit/plebbit-cli/compare/v0.7.8...v0.7.9) (2023-08-18)


### Bug Fixes

* **api:** handle error events of subs ([0141fb4](https://github.com/plebbit/plebbit-cli/commit/0141fb4aa4dba53d8f8436676b9ac3dadb5cc45c))
* **api:** handle error events of subs ([50527b3](https://github.com/plebbit/plebbit-cli/commit/50527b33f13af745352c88fa3e93a0e34b2bbc9b))

## [0.7.8](https://github.com/plebbit/plebbit-cli/compare/v0.7.7...v0.7.8) (2023-08-17)


### Performance Improvements

* **daemon:** optimize seeding ([fa27931](https://github.com/plebbit/plebbit-cli/commit/fa279319c5d27e3a9b976ec959f92d252e66b8d9))

## [0.7.7](https://github.com/plebbit/plebbit-cli/compare/v0.7.6...v0.7.7) (2023-07-20)

## [0.7.6](https://github.com/plebbit/plebbit-cli/compare/v0.7.5...v0.7.6) (2023-07-16)

## [0.7.5](https://github.com/plebbit/plebbit-cli/compare/v0.7.4...v0.7.5) (2023-07-16)

## [0.7.4](https://github.com/plebbit/plebbit-cli/compare/v0.7.3...v0.7.4) (2023-07-12)

## [0.7.3](https://github.com/plebbit/plebbit-cli/compare/v0.7.2...v0.7.3) (2023-06-16)

## [0.7.2](https://github.com/plebbit/plebbit-cli/compare/v0.7.1...v0.7.2) (2023-04-23)

## [0.7.1](https://github.com/plebbit/plebbit-cli/compare/v0.7.0...v0.7.1) (2023-04-23)


### Bug Fixes

* **api:** fixed bug where daemon --seed expects node to be online at all time ([cdf3ac3](https://github.com/plebbit/plebbit-cli/commit/cdf3ac3e0b1ff10941ddeb3f6e3ba85cae31d140)), closes [#8](https://github.com/plebbit/plebbit-cli/issues/8)

# [0.7.0](https://github.com/plebbit/plebbit-cli/compare/v0.6.6...v0.7.0) (2023-04-18)


### Bug Fixes

* **api:** start seeding immedietly, no need to wait for 5 minutes ([f917fbd](https://github.com/plebbit/plebbit-cli/commit/f917fbd0676207cb3aa4ecd3e9f22ceb1e75f8ab))
* **cli:** seed flag is now separated into a boolean for seeding, and another flag for seeded subs ([ba9aa48](https://github.com/plebbit/plebbit-cli/commit/ba9aa4877a12916d6350c2274110558ab8d56e34))
* **deps:** migrate ipfs when running daemon ([41107c5](https://github.com/plebbit/plebbit-cli/commit/41107c55c5d046d80ddbee148f75927c1b141dbd))


### Features

* **api:** added an option to seed subs publications as well as propagation of their msgs ([71d4032](https://github.com/plebbit/plebbit-cli/commit/71d4032c0ee724eee8d827a3d90780406b8ba78f)), closes [#5](https://github.com/plebbit/plebbit-cli/issues/5)
* **api:** added an option to seed subs publications as well as propgation of their msgs ([11369f2](https://github.com/plebbit/plebbit-cli/commit/11369f2cc485ab8bd6817d8aa2001cc308cb807e)), closes [#5](https://github.com/plebbit/plebbit-cli/issues/5)


### Performance Improvements

* **api:** increase time between seedings from 5m to 10m ([6050a9b](https://github.com/plebbit/plebbit-cli/commit/6050a9b80ae6eef94e68fb8f79da459992304ad2))
* **api:** limit concurrency with ipns and add more debug msgs ([11a9d78](https://github.com/plebbit/plebbit-cli/commit/11a9d78715cbf6ebaf00c13f2519413e9f2eb404))

## [0.6.6](https://github.com/plebbit/plebbit-cli/compare/v0.6.5...v0.6.6) (2023-04-18)

## [0.6.5](https://github.com/plebbit/plebbit-cli/compare/v0.6.4...v0.6.5) (2023-04-01)

## [0.6.4](https://github.com/plebbit/plebbit-cli/compare/v0.6.3...v0.6.4) (2023-03-31)


### Bug Fixes

* **api:** rework the logic of subplebbit create HTTP endpoint ([3e0c832](https://github.com/plebbit/plebbit-cli/commit/3e0c83208ae4dfa809ab796c42dfe0bc6c89cef0))
* **cli:** fixed bug where cli role set creates a new sub instead of editing existing one ([5e4ed72](https://github.com/plebbit/plebbit-cli/commit/5e4ed72d4fefbe0412edeba8633ddce1fc776c9c))

## [0.6.3](https://github.com/plebbit/plebbit-cli/compare/v0.6.2...v0.6.3) (2023-03-30)

## [0.6.2](https://github.com/plebbit/plebbit-cli/compare/v0.6.1...v0.6.2) (2023-03-30)

## [0.6.1](https://github.com/plebbit/plebbit-cli/compare/v0.6.0...v0.6.1) (2023-03-30)

# [0.6.0](https://github.com/plebbit/plebbit-cli/compare/v0.5.1...v0.6.0) (2023-03-30)


### Features

* **cli:** add settings field to subplebbit edit in CLI ([0521c17](https://github.com/plebbit/plebbit-cli/commit/0521c17bcd58e051e0e8b44a1057cd5cfb50df53))

## [0.5.1](https://github.com/plebbit/plebbit-cli/compare/v0.5.0...v0.5.1) (2023-03-30)

# [0.5.0](https://github.com/plebbit/plebbit-cli/compare/v0.4.1...v0.5.0) (2023-01-16)


### Features

* **deps:** update plebbit-js ([af72a6b](https://github.com/plebbit/plebbit-cli/commit/af72a6bf8081b3773159a8da729cb5637004af8f))

## [0.4.1](https://github.com/plebbit/plebbit-cli/compare/v0.4.0...v0.4.1) (2022-12-23)

# [0.4.0](https://github.com/plebbit/plebbit-cli/compare/v0.3.1...v0.4.0) (2022-12-20)


### Features

* **cli:** implemented `plebbit subplebbit stop` to stop running subs from receiving and publishing ([f9e5c0a](https://github.com/plebbit/plebbit-cli/commit/f9e5c0ad59d06437597cd3097fd9d86c024ad8ae))

## [0.3.1](https://github.com/plebbit/plebbit-cli/compare/v1.3.0...v0.3.1) (2022-12-20)

# [0.3.0](https://github.com/plebbit/plebbit-cli/compare/0.2.0...v0.3.0) (2022-12-14)


### Features

* **cli:** a cli command to remove authors' roles within a subplebbit ([372a1e6](https://github.com/plebbit/plebbit-cli/commit/372a1e639fe0134ff1bc8a660e5e28c48c8c6125))

# [0.2.0](https://github.com/plebbit/plebbit-cli/compare/v0.1.1...v0.2.0) (2022-12-14)


### Features

* **cli:** a cli command to set roles for authors within a subplebbit ([d16d0ab](https://github.com/plebbit/plebbit-cli/commit/d16d0abfdf8e4c8a453d6f25e36d053c0ada267d))

## [0.1.1](https://github.com/plebbit/plebbit-cli/compare/v0.1.0...v0.1.1) (2022-12-13)


### Bug Fixes

* **cli:** iPFS node is restarted everytime it exits because of an error ([128e725](https://github.com/plebbit/plebbit-cli/commit/128e7259c25b49f9fa5566d052e08191c89f3dbb))

# [0.1.0](https://github.com/plebbit/plebbit-cli/compare/v0.0.0...v0.1.0) (2022-12-07)


### Features

* **cli-subplebbit-create:** replace privateKey option with privateKeyPath. A path to PEM file ([2f99706](https://github.com/plebbit/plebbit-cli/commit/2f99706eacbf3ad471e1364f2f399287638320a6))
* **cli-subplebbit-create:** start subplebbit after creating automatically ([2fb0dd5](https://github.com/plebbit/plebbit-cli/commit/2fb0dd520de86721aa740df34ed18085ace0661a))

# 0.0.1 (2022-12-06)


### Bug Fixes

* **cli:** use a different data path for IPFS node within daemon ([b98ed86](https://github.com/plebbit/plebbit-cli/commit/b98ed86c2ffdad33628dbcde34456aa75eae1c9e))