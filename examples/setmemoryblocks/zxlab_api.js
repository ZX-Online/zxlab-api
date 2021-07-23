/**
 * ZXLab API wrapper
 * 
 */

/**
 * THis class wrapped provide simpler access to ZXLab API
 * 
 * @param {object} HTML IFRAME element pointer where the ZXLab emulator ran 
 */
function ZXLab_API(emulator_element) 
{
	/*
	// Codes of operations:
	// 0x53 - reset
	// 0x54 - pause
	// 0x55 - setmem
	// 0x56 - getmem request
	// 0xd6 - getmem response - sent by zxlab emulator 
	// 0x57 - setports
	// 0x58 - getports request
	// 0xd8 - getports response - sent by zxlab emulator
	// 0x59 - setregs
	// 0x5a - getregs request
	// 0xda - getregs response - sent by zxlab emulator
	// 
	// 0xcd - call
	// 0xc9 - call return - sent by zxlab emulator
	*/

	this.el = emulator_element;

	var b64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

	this.base64encode = function(bin)
	{
		var s = '';
		var i = 0;
		var b0 = 0;
		var b1 = 0;
		var b2 = 0;
		while (i < bin.length) {
			b0 = bin[i++];
			s += b64[b0 >> 2];
			if (i < bin.length) {
				b1 = bin[i++];
				s += b64[((b0 & 0x03) << 4) | ((b1 & 0xf0) >> 4)];
				if (i < bin.length) {
					b2 = bin[i++];
					
					// Encode 3 bytes
					s += b64[((b1 & 0x0f) << 2) | ((b2 & 0xc0) >> 6)];
					s += b64[b2 & 0x3f];
				} else {
					// Encode 2 bytes
					s += b64[(b1 & 0x0f) << 2];
					s += b64[0x40];
				}
			} else {
				// Encode 1 byte
				s += b64[(b0 & 0x03) << 4];
				s += b64[0x40];
				s += b64[0x40];
			}
		}
	
		return s;
	};

	this.send = function(data)
	{
		this.el.contentWindow.postMessage(data, '*');
	};

	this.setMemoryBlock = function(addr, data)
	{
		return this.setMemoryBlocks([[addr, data]]);
	};

	this.setMemoryBlocks = function(blocks)
	{
		var len = 0;
		for (var blk of blocks) {
			len += 5 + blk[1].length;
		}

		var buf = new Uint8Array(len);

		var i = 0;
		for (var blk of blocks) {
			buf[i++] = blk[0] & 0xff;
			buf[i++] = (blk[0] & 0xff00) >> 8;
			buf[i++] = (blk[0] & 0xff0000) >> 16;

			var len = blk[1].length;
			buf[i++] = len & 0xff;
			buf[i++] = (len & 0xff00) >> 8;
			for (var t of blk[1]) {
				buf[i++] = t;
			}
		}

		let letter = [['setmem', this.base64encode(buf)]];

		this.send(letter);
	};

}
