# COINSTAC Algorithm Permutator

## Purpose

Testing [MRN-Code/decentralized-laplacian-ridge-regression](https://github.com/MRN-Code/decentralized-laplacian-ridge-regression) with every permutation of the [test sites](./mocks/).

## Running

1. Clone [MRN-Code/coinstac](https://github.com/MRN-Code/coinstac)
2. Build _coinstac_

    ```shell
    cd coinstac
    npm install && npm run build
    ```

3. Link _coinstac-simulator_:

    ```shell
    cd packages/coinstac-simulator
    npm link
    ```
4. Clone [MRN-Code/decentralized-laplacian-ridge-regression](https://github.com/MRN-Code/decentralized-laplacian-ridge-regression)
5. Link _laplacian-noise-ridge-regression_:

    ```shell
    cd decentralized-laplacian-ridge-regression
    npm link
    ```
6. Clone this repository
7. Install dependencies:

    ```shell
    cd coinstac-algorithm-permutator
    npm install
    ```
8. Link _coinstac-simulator_ and _laplacian-noise-ridge-regression_:

    ```shell
    npm link coinstac-simulator
    npm link laplacian-noise-ridge-regression
    ```
9. Run the permutations!

    ```shell
    npm start
    ```
