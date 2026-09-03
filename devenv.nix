{ pkgs, ... }:

{
  dotenv.disableHint = true;

  languages.javascript = {
    enable = true;
    package = pkgs.nodejs_22;
    pnpm = {
      enable = true;
      install.enable = true;
    };
  };

  languages.typescript.enable = true;
}
