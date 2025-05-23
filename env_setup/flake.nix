{
  description = "Development environment with Python, Java, web scraping tools, PostgreSQL, MongoDB Shell, and Node.js";
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };
  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs {
           inherit system;
           config.allowUnfree = true; # MongoDB packages are unfree
        };
        
        # Python packages - merged from both configurations
        pythonEnv = pkgs.python312.withPackages (python-pkgs: with python-pkgs; [
          # From existing flake
          pandas
          requests
          selenium
          beautifulsoup4
          configparser
          psycopg2
          scikit-learn
          pymongo  # Python MongoDB driver
          
          # From shell.nix
          pip
          ipython
          jupyter
          notebook
          scipy
          matplotlib
          seaborn
        ]);
      in
      {
        devShells.default = pkgs.mkShell {
          packages = [
            # Python
            pythonEnv
            # Java
            pkgs.jdk
            pkgs.maven
            # Scraping
            pkgs.geckodriver
            pkgs.firefox
            # Databases
            pkgs.postgresql_15
            pkgs.mongodb-ce  # MongoDB server
            pkgs.mongosh # MongoDB shell
            # JavaScript
            pkgs.nodejs_22
            # Mongo deps
            pkgs.gcc
            pkgs.gnumake
            pkgs.openssl
            pkgs.cyrus_sasl
            pkgs.pkg-config
          ];
          
          # Merged shellHook combining MongoDB setup and pip configuration
          shellHook = ''
            # Create MongoDB data directory if it doesn't exist
            export MONGO_DATA_DIR="$PWD/.mongo/data"
            mkdir -p $MONGO_DATA_DIR
            
            # MongoDB configuration
            export MONGO_PORT=27017
            export MONGO_URL="mongodb://localhost:$MONGO_PORT"
            
            # You can uncomment these lines to automatically start MongoDB
            # echo "Starting MongoDB server..."
            # mongod --dbpath $MONGO_DATA_DIR --port $MONGO_PORT --bind_ip 127.0.0.1 &
            # MONGO_PID=$!
            # trap "kill $MONGO_PID" EXIT
            
            echo "MongoDB environment configured. You can start MongoDB manually with:"
            echo "mongod --dbpath $MONGO_DATA_DIR --port $MONGO_PORT --bind_ip 127.0.0.1"
            
            # PIP configuration from shell.nix
            export PIP_PREFIX="$(pwd)/_build/pip_packages"
            export PYTHONPATH="$PIP_PREFIX/${pkgs.python312.sitePackages}:$PYTHONPATH"
            export PATH="$PIP_PREFIX/bin:$PATH"
            unset SOURCE_DATE_EPOCH
          '';
        };
      }
    );
}
