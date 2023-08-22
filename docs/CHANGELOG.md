

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