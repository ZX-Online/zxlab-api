/**
 * ZXLab API wrapper
 * 
 */

/**
 * This class wrapped provide simpler access to ZXLab API
 * 
 * @param {object} HTML IFRAME element pointer where the ZXLab emulator ran 
 */
class ZXLab_API
{
	/*
	// Codes of operations:
	// .0x51 - NMI
	// .0x52 - reset
	// .0x53 - pause ON (stop CPU)
	// .0x54 - pause OFF (release CPU)
	// .0x55 - setmem
	// 0x56 - getmem request
	// 0xd6 - getmem response - sent by zxlab emulator 
	// 0x57 - setports
	// 0x58 - getports request
	// 0xd8 - getports response - sent by zxlab emulator
	// 0x59 - setregs
	// 0x5a - getregs request
	// 0xda - getregs response - sent by zxlab emulator
	// 
	// .0xc3 - jump <address>
	// 0xcd - call <address>
	// 0xc9 - call return - sent by zxlab emulator
	*/
	constructor(emulator_element, is_debug = false)
	{
		this.el = emulator_element;
		this.is_debug = is_debug;

		this.textTranslationTable = {};	
	}

	static attachTo(element, is_debug = false)
	{
		return new ZXLab_API(element, is_debug);
	}

	send(data)
	{
		if (this.is_debug) {
			console.log('Sending data to ZXLab API: ');
			console.log(data);	
		}

		//this.el.contentWindow.postMessage(data.buffer, '*', [data.buffer]);
		this.el.contentWindow.postMessage(data, '*');	// ArrayBuffer does not yet supported as transferable type
	}

	sendOneByte(b)
	{
		var buf = new Uint8Array(3);

		// Add ZXLab API marker
		var i = 0;
		buf[i++] = 0x78;	// x
		buf[i++] = 0x7a;	// z

		buf[i++] = b;	// One-byte command with no parameters

		this.send(buf);
	}

	NMI()
	{
		this.sendOneByte(0x51);	// NMI
	}

	reset()
	{
		this.sendOneByte(0x52);	// Reset
	}

	stopCPU()
	{
		this.sendOneByte(0x53);	// Stop CPU
	}

	releaseCPU()
	{
		this.sendOneByte(0x54);	// Release CPU
	}

	setMemoryBlock(addr, data)
	{
		return this.setMemoryBlocks([[addr, data]]);
	}

	setMemoryBlocks(blocks)
	{
		// addr is always integer from 0x000000 to 0xffffff
		// data can be integer, array, string or Uint8Array

		// Let's estimate the length of the resulting arraybuffer
		var len = 0;
		len += 2;	// 2 bytes for marker
		for (var blk of blocks) {
			var data = blk[1];
			var tp = typeof data;
			var is_valid_block = true;
			switch (tp) {
				case 'number':
					len++;
					break;
				case 'string':
					len += tp.length;
					break;
				case 'boolean':
					len++;
					break;
				default:
					//'object':
					if (Array.isArray(data)) {
						len += data.length;
					} else {
						if (data.constructor === Uint8Array) {
							len += data.length;
						} else {
							console.log('The block #' + i + ' has not supported data format. This block will be ignored.');
							is_valid_block = false;
						}
					}
			}
			if (is_valid_block) {
				len += 6;	// Each header takes 6 bytes
			}
		}

		var buf;
		if (len > 5) {
			buf = new Uint8Array(len);
			var i = 0;

			// Add ZXLab API marker
			buf[i++] = 0x78;	// x
			buf[i++] = 0x7a;	// z

			for (var blk of blocks) {
				var data = blk[1];

				buf[i++] = 0x55;	// SetMemoryBlock

				var i_blkstart = i;
				i += 5;

				var tp = typeof data;
				var is_valid_block = true;
				switch (tp) {
					case 'number':
						buf[i++] = parseInt(data);
						break;
					case 'string':
						for (var ii = 0; ii < data.length; ii++) {
							var ch = data.charCodeAt(ii);
							buf[i++] = (ch in this.textTranslationTable) ? this.textTranslationTable[ch] : ch;
						}
						break;
					case 'boolean':
						buf[i++] = data ? 1 : 0;
						break;
					default:
						//'object':
						if (Array.isArray(data)) {
							for (var ii = 0; ii < data.length; ii++) {
								buf[i++] = parseInt(data[ii]);
							}
						} else {
							if (data.constructor === Uint8Array) {
								for (var ii = 0; ii < data.length; ii++) {
									buf[i++] = data[ii];
								}
							} else {
								is_valid_block = false;
							}
						}
				}

				if (is_valid_block) {
					var len = i - i_blkstart - 5;

					// Put the address of the block
					buf[i_blkstart++] = blk[0] & 0xff;
					buf[i_blkstart++] = (blk[0] & 0xff00) >> 8;
					buf[i_blkstart++] = (blk[0] & 0xff0000) >> 16;

					buf[i_blkstart++] = len & 0xff;
					buf[i_blkstart++] = (len & 0xff00) >> 8;
				}
			}

			this.send(buf);
		}

		return false;
	}

	jump(adr)
	{
		var buf = new Uint8Array(5);

		// Add ZXLab API marker
		var i = 0;
		buf[i++] = 0x78;	// x
		buf[i++] = 0x7a;	// z

		buf[i++] = 0xc3;	// Jump <addr>

		buf[i++] = adr & 0x00ff;
		buf[i++] = (adr >> 8) & 0x00ff;

		this.send(buf);
	}
};

// UMD block
if (typeof module === 'object' && module.exports) {
	// Node.
	module.exports = ZXLab_API;
} else if (typeof define === 'function' && define.amd) {
	// AMD. Register as an anonymous module.
	define(['zxlab-api'], ZXLab_API);
} else {
	// Browser globals (root is window)
	//window.ZXLab_API = ZXLab_API;
}
