{ pkgs ? import <nixpkgs> {} }: with pkgs; mkShell {
  buildInputs = with python312Packages; [
    python312
    python312Packages.pip
    ipython 
    jupyter
    notebook
    scipy
    pandas
    scikit-learn
    matplotlib
    seaborn
    # Add any other Python packages you need here
  ];

  # This sets up pip to work properly in the shell environment
  shellHook = ''
    export PIP_PREFIX="$(pwd)/_build/pip_packages"
    export PYTHONPATH="$PIP_PREFIX/${pkgs.python312.sitePackages}:$PYTHONPATH"
    export PATH="$PIP_PREFIX/bin:$PATH"
    unset SOURCE_DATE_EPOCH
  '';
}

