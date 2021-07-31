/**
 * ZXLab API wrapper
 * 
 */

/**
 * This class wrapped provide simpler access to ZXLab API
 * 
 * @param {object} HTML IFRAME element pointer where the ZXLab emulator ran 
 */
function ZXLab_API(emulator_element) 
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

	this.el = emulator_element;

	this.textTranslationTable = {};

	this.send = function(data)
	{
		this.el.contentWindow.postMessage(data, '*', [data.buffer]);

		console.log('Sent data: ');
		console.log(data);
	};

	this.sendOneByte = function(b)
	{
		var buf = new Uint8Array(3);

		// Add ZXLab API marker
		var i = 0;
		buf[i++] = 0x78;	// x
		buf[i++] = 0x7a;	// z

		buf[i++] = b;	// One-byte command with no parameters

		this.send(buf);
	};

	this.NMI = function()
	{
		this.sendOneByte(0x51);	// NMI
	}

	this.reset = function()
	{
		this.sendOneByte(0x52);	// Reset
	}

	this.stopCPU = function()
	{
		this.sendOneByte(0x53);	// Stop CPU
	}

	this.releaseCPU = function()
	{
		this.sendOneByte(0x54);	// Release CPU
	}

	this.setMemoryBlock = function(addr, data)
	{
		return this.setMemoryBlocks([[addr, data]]);
	};

	this.setMemoryBlocks = function(blocks)
	{
		// addr is always integer from 0x000000 to 0xffffff
		// data can be integer, array, string or Uint8Array

		// Let's estimate the length of the resulting arraybuffer
		var len = 0;
		for (var blk of blocks) {
			var data = blk[1];
			var tp = typeof data;
			var is_valid_block = true;
			switch (tp) {
				case 'number':
					len ++;
					break;
				case 'string':
					len += tp.length;
					break;
				case 'boolean':
					len ++;
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
				len += 5;
			}
		}

		if (len > 5) {
			var buf = new Uint8Array(len);
			var i = 0;

			// Add ZXLab API marker
			buf[i++] = 0x78;	// x
			buf[i++] = 0x7a;	// z

			buf[i++] = 0x55;	// SetMemoryBlock

			for (var blk of blocks) {
				var data = blk[1];

				var i_blkstart = i;
				i += 5;

				var tp = typeof data;
				var is_valid_block = true;
				switch (tp) {
					case 'number':
						buf[i++] = parseInt(data);
						break;
					case 'string':
						for (var ii = 0; ii < data.length; ii ++) {
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
							for (var ii = 0; ii < data.length; ii ++) {
								buf[i++] = parseInt(data[ii]);
							}
						} else {
							if (blk.constructor === Uint8Array) {
								for (var ii = 0; ii < data.length; ii ++) {
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
		}

		this.send(buf);
	}

	this.jump = function(adr)
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


}

module.exports = ZXLab_API;