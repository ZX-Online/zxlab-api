# ZXLab API Wrapper

This is a Javascript library that provides an access to ZXLab API. You can include it to your pure js application.

To use this wrapper with React, please use `npm install` or `yarn add` (see below).

## Installation

You can connect this ZXLab API Wrapper to your browser using direct URL

```
<script src="https://cdn.jsdelivr.net/gh/ZX-Online/zxlab-api@latest/zxlab_api.js"></script>
```

In case you're using React-based app, use 

`npm install zxlab-api -s`

or 

`yarn add zxlab-api`


## Usage

Examples

Use setMemoryBlock directly from browser:
https://www.youtube.com/watch?v=ikF-R_oMlnk


## Contributing

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D

## History

I the middle of 2020 I realized that the development of games (in particular, ZX Spectrum games) should be started from a minimal working prototype (MVP). Most of the programmers making this using Delphi, Python, and even pure C++!

As a rule, these people start by writing their own "Spectrum Emulator", because the source codes of the existing ones seem difficult to learn.

As a Nodejs, React, and Javascript lover, I decided to make a more or less universal solution that can help enthusiasts over the world developing mock-ups and prototypes of ZX Spectrum games. First of all, you don't need to develop your own ZX Spectrum emulator anymore. ZXLab Emulator is a standalone WASM-based application that can be run into a separate IFRAME and can be deeply controlled via ZXLab API.

I called it ZXLab because it allows to use virtual ZX Spectrum machine to be a "Guinea pig" so you can control it completely. You can stop and start the CPU at any moment, put and read any blocks of RAM, draw on its screen directly, run Z80 code and javascript code at the same time, and many more.

The main idea was the possibility of a smooth transition from the prototype to the real z80 code by sequentially rewriting the algorithms from javascript to z80 ASM until all the game code will be written in z80 ASM and be capable to run under REAL ZX Spectrum hardware.

## Credits

As far as I know, only I am developing this package at the moment. Do not worry, you can participate!

## License

MIT