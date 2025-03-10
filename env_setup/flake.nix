{
  description = "Development environment with Python, Java, web scraping tools, PostgreSQL, and Node.js";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
        
        # Python packages
        pythonEnv = pkgs.python3.withPackages (python-pkgs: with python-pkgs; [
          pandas
          requests
          selenium
          beautifulsoup4
          configparser
          psycopg2
          scikit-learn
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
            # Database
            pkgs.postgresql_15
            # JavaScript
            pkgs.nodejs_22
          ];
          
          # You can add environment variables here if needed
          # shellHook = ''
          #   export DATABASE_URL="postgresql://localhost:5432/mydb"
          # '';
        };
      }
    );
}
