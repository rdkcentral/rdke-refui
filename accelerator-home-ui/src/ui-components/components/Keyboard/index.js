/*
* If not stated otherwise in this file or this component's LICENSE file the
* following copyright and licenses apply:
*
* Copyright 2021 RDK Management
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
* http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*
* Copyright 2021 Comcast Cable Communications Management, LLC
* Licensed under the Apache License, Version 2.0
*/

import lng from '@lightningjs/core';
import Key, { KEY_DIMENSIONS } from './Key';
import Row from '../Row';
import Column from '../Column';

export default class Keyboard extends lng.Component {
  _construct() {
    this._whenEnabled = new Promise(resolve => (this._firstEnable = resolve));
  }

  get announce() {
    return 'Keyboard' + (this.title ? `, ${this.title}` : '');
  }

  get announceContext() {
    return [
      'PAUSE-2',
      'Use arrow keys to choose characters, press center to select'
    ];
  }

  set formats(formats = {}) {
    this._formats = formats;
    this._currentFormat = this._defaultFormat;
    // Ensure formats prop is set last
    this._whenEnabled.then(() => {
      Object.entries(formats).forEach(([key, value]) => {
        let keyboardData = this._formatKeyboardData(value);
        this._createKeyboard(key, this._createRows(keyboardData));
      });
      this.tag(this._currentFormat).alpha = 1;
      this._refocus();
    });
  }

  _createKeyboard(key, rows = []) {
    key = key.charAt(0).toUpperCase() + key.slice(1);
    if (rows.length === 1) {
      this.patch({ [key]: { ...rows[0], alpha: 0 } });
    } else {
      this.patch({
        [key]: {
          type: Column,
          alpha: 0,
          plinko: true,
          itemSpacing: this._spacing,
          items: rows
        }
      });
    }
  }

  _createRows(rows = []) {
    return rows.map(keys => {
      let h = (this.keysConfig && this.keysConfig.h) || KEY_DIMENSIONS.h;
      return {
        type: Row,
        h,
        wrapSelected: this.rowWrap === undefined ? true : this.rowWrap,
        itemSpacing: this._spacing,
        items: this._createKeys(keys)
      };
    });
  }

  _createKeys(keys = []) {
    return keys.map(keyProps => {
      const key = {
        type: this.keyComponent || Key,
        config: this.keysConfig
      };
      if (!keyProps) {
        return { ...KEY_DIMENSIONS, skipFocus: true };
      } else if (typeof keyProps === 'object') {
        return { ...key, ...keyProps };
      }
      return { ...key, label: keyProps };
    });
  }

  _formatKeyboardData(data = []) {
    if (Array.isArray(data) && data.length) {
      if (!Array.isArray(data[0]) && !this.inline) {
        let keyRows = [],
          idx,
          counter;
        for (idx = 0, counter = -1; idx < data.length; idx++) {
          if (idx % this.columnCount === 0) {
            counter++;
            keyRows[counter] = [];
          }
          keyRows[counter].push(data[idx]);
        }
        return keyRows;
      } else if (this.inline) {
        return [data];
      }
      return data;
    }
  }

  $toggleKeyboard(keyboardFormat) {
    keyboardFormat =
      keyboardFormat.charAt(0).toUpperCase() + keyboardFormat.slice(1);
    if (keyboardFormat !== this._currentFormat) {
      this.selectKeyOn(this.tag(keyboardFormat));
      this.tag(this._currentFormat).alpha = 0;
      this.tag(keyboardFormat).alpha = 1;
      this._currentFormat = keyboardFormat;
    }
  }

  selectKeyOn(keyboard, { row, column } = this.getSelectedKey()) {
    let type = keyboard.constructor.name;
    if (type === 'Row') {
      keyboard.selectedIndex = column;
    } else {
      keyboard.selectedIndex = row;
      keyboard.Items.children[row].selectedIndex = column;
    }
  }

  getSelectedKey() {
    let row, column;
    let keyboard = this.tag(this._currentFormat);
    let type = keyboard.constructor.name;
    if (type === 'Row') {
      row = 0;
      column = keyboard.selectedIndex;
    } else {
      row = keyboard.selectedIndex;
      column = keyboard.Items.children[row].selectedIndex;
    }
    return { row, column };
  }

  _getFocused() {
    return this.tag(this._currentFormat) || this;
  }

  _focus() {
    this.fireAncestors('$keyboardFocused', true);
  }

  _unfocus() {
    this.tag(this._currentFormat).alpha = 0;
    this._currentFormat = this._defaultFormat
    this.tag(this._currentFormat).alpha = 1;
    this._refocus();
    this.fireAncestors('$keyboardFocused', false);
  }

  set columnCount(columnCount) {
    this._columnCount = columnCount;
  }

  set rowCount(rowCount) {
    this._rowCount = rowCount;
  }

  get columnCount() {
    if (this._columnCount) return this._columnCount;
    if (this._rowCount)
      return (
        this._formats[this._defaultFormat.toLowerCase()].length / this._rowCount
      );
    if (this.inline)
      return this._formats[this._defaultFormat.toLowerCase()].length;
    else return 11;
  }

  get _spacing() {
    return this.spacing || 8;
  }

  get _defaultFormat() {
    let defaultFormat = this.defaultFormat || Object.keys(this._formats)[0];
    return defaultFormat.charAt(0).toUpperCase() + defaultFormat.slice(1);
  }
}

export const KEYBOARD_FORMATS = {
  fullscreen: {
    letters: [
      [
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        {
          label: '#@!',
          size: 'large',
          toggle: 'symbols',
          announce: 'symbol mode, button'
        },
        { label: 'Space', size: 'large' },
        { label: 'Delete', size: 'large' },
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        ''
      ],
      [
        'A',
        'B',
        'C',
        'D',
        'E',
        'F',
        'G',
        'H',
        'I',
        'J',
        'K',
        'L',
        'M',
        'N',
        'O',
        'P',
        'Q',
        'R',
        'S',
        'T',
        'U',
        'V',
        'W',
        'X',
        'Y',
        'Z'
      ]
    ],
    symbols: [
      [
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        {
          label: 'ABC',
          size: 'large',
          toggle: 'letters',
          announce: 'caps on, button'
        },
        { label: 'Space', size: 'large' },
        { label: 'Delete', size: 'large' },
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        ''
      ],
      [
        '1',
        '2',
        '3',
        '4',
        '5',
        '6',
        '7',
        '8',
        '9',
        '0',
        { label: '!', announce: 'exclamation, button' },
        '@',
        '#',
        '$',
        '%',
        { label: '^', announce: 'caret circumflex, button' },
        '&',
        '*',
        { label: '(', announce: 'open parenthesis, button' },
        { label: ')', announce: 'close parenthesis, button' },
        { label: '`', announce: 'grave accent, button' },
        '~',
        '_',
        '.',
        '-',
        '+'
      ]
    ]
  },
  qwerty: {
    uppercase: [
      [
        '1',
        '2',
        '3',
        '4',
        '5',
        '6',
        '7',
        '8',
        '9',
        '0',
        { label: 'Clear', size: 'medium' }
      ],
      [
        'Q',
        'W',
        'E',
        'R',
        'T',
        'Y',
        'U',
        'I',
        'O',
        'P',
        {
          label: '#@!',
          size: 'medium',
          toggle: 'symbols',
          announce: 'symbol mode, button'
        }
      ],
      [
        'A',
        'S',
        'D',
        'F',
        'G',
        'H',
        'J',
        'K',
        'L',
        '@',
        {
          label: 'áöû',
          size: 'medium',
          toggle: 'accents',
          announce: 'accents, button'
        }
      ],
      [
        'Z',
        'X',
        'C',
        'V',
        'B',
        'N',
        'M',
        { label: '_', announce: 'underscore, button' },
        { label: '.', announce: 'period, button' },
        { label: '-', announce: 'dash, button' },
        {
          label: 'shift',
          size: 'medium',
          toggle: 'lowercase',
          announce: 'shift off, button'
        }
      ],
      [
        { label: 'Delete', size: 'large' },
        { label: 'Space', size: 'xlarge' },
        { label: 'Done', size: 'large' }
      ]
    ],
    lowercase: [
      [
        '1',
        '2',
        '3',
        '4',
        '5',
        '6',
        '7',
        '8',
        '9',
        '0',
        { label: 'Clear', size: 'medium' }
      ],
      [
        'q',
        'w',
        'e',
        'r',
        't',
        'y',
        'u',
        'i',
        'o',
        'p',
        {
          label: '#@!',
          size: 'medium',
          toggle: 'symbols',
          announce: 'symbol mode, button'
        }
      ],
      [
        'a',
        's',
        'd',
        'f',
        'g',
        'h',
        'j',
        'k',
        'l',
        '@',
        {
          label: 'áöû',
          size: 'medium',
          toggle: 'accents',
          announce: 'accents, button'
        }
      ],
      [
        'z',
        'x',
        'c',
        'v',
        'b',
        'n',
        'm',
        { label: '_', announce: 'underscore, button' },
        { label: '.', announce: 'period, button' },
        { label: '-', announce: 'dash, button' },
        {
          label: 'shift',
          size: 'medium',
          toggle: 'uppercase',
          announce: 'shift on, button'
        }
      ],
      [
        { label: 'Delete', size: 'large' },
        { label: 'Space', size: 'xlarge' },
        { label: 'Done', size: 'large' }
      ]
    ],
    accents: [
      [
        '1',
        '2',
        '3',
        '4',
        '5',
        '6',
        '7',
        '8',
        '9',
        '0',
        { label: 'Clear', size: 'medium' }
      ],
      [
        'ä',
        'ë',
        'ï',
        'ö',
        'ü',
        'ÿ',
        'à',
        'è',
        'ì',
        'ò',
        {
          label: '#@!',
          size: 'medium',
          toggle: 'symbols',
          announce: 'symbol mode, button'
        }
      ],
      [
        'ù',
        'á',
        'é',
        'í',
        'ó',
        'ú',
        'ý',
        'â',
        'ê',
        'î',
        {
          label: 'abc',
          size: 'medium',
          toggle: 'lowercase',
          announce: 'alpha mode, button'
        }
      ],
      [
        '',
        '',
        '',
        'ô',
        'û',
        'ã',
        'ñ',
        '',
        '',
        '',
        {
          label: 'shift',
          size: 'medium',
          toggle: 'accentsUpper',
          announce: 'shift off, button'
        }
      ],
      [
        { label: 'Delete', size: 'large' },
        { label: 'Space', size: 'xlarge' },
        { label: 'Done', size: 'large' }
      ]
    ],
    accentsUpper: [
      [
        '1',
        '2',
        '3',
        '4',
        '5',
        '6',
        '7',
        '8',
        '9',
        '0',
        { label: 'Clear', size: 'medium' }
      ],
      [
        'Ä',
        'Ë',
        'Ï',
        'Ö',
        'Ü',
        'Ÿ',
        'À',
        'È',
        'Ì',
        'Ò',
        {
          label: '#@!',
          size: 'medium',
          toggle: 'symbols',
          announce: 'symbol mode, button'
        }
      ],
      [
        'Ù',
        'Á',
        'É',
        'Í',
        'Ó',
        'Ú',
        'Ý',
        'Â',
        'Ê',
        'Î',
        {
          label: 'abc',
          size: 'medium',
          toggle: 'lowercase',
          announce: 'alpha mode, button'
        }
      ],
      [
        '',
        '',
        '',
        'Ô',
        'Û',
        'Ã',
        'Ñ',
        '',
        '',
        '',
        {
          label: 'shift',
          size: 'medium',
          toggle: 'accents',
          announce: 'shift off, button'
        }
      ],
      [
        { label: 'Delete', size: 'large' },
        { label: 'Space', size: 'xlarge' },
        { label: 'Done', size: 'large' }
      ]
    ],
    symbols: [
      [
        '1',
        '2',
        '3',
        '4',
        '5',
        '6',
        '7',
        '8',
        '9',
        '0',
        { label: 'Clear', size: 'medium' }
      ],
      [
        { label: '!', announce: 'exclamation, button' },
        '@',
        '#',
        '$',
        '%',
        { label: '^', announce: 'caret circumflex, button' },
        '&',
        '*',
        { label: '(', announce: 'open parenthesis, button' },
        { label: ')', announce: 'close parenthesis, button' },
        {
          label: 'abc',
          size: 'medium',
          toggle: 'lowercase',
          announce: 'alpha mode, button'
        }
      ],
      [
        { label: '{', announce: 'open brace, button' },
        { label: '}', announce: 'close brace, button' },
        { label: '[', announce: 'open bracket, button' },
        { label: ']', announce: 'close bracket, button' },
        { label: ';', announce: 'semicolon, button' },
        { label: '"', announce: 'doublequote, button' },
        { label: "'", announce: 'singlequote, button' },
        { label: '|', announce: 'vertical bar, button' },
        { label: '\\', announce: 'backslash, button' },
        { label: '/', announce: 'forwardslash, button' },
        {
          label: 'áöû',
          size: 'medium',
          toggle: 'accents',
          announce: 'accents, button'
        }
      ],
      [
        { label: '<', announce: 'less than, button' },
        { label: '>', announce: 'greater than, button' },
        { label: '?', announce: 'question mark, button' },
        { label: '=', announce: 'equals, button' },
        { label: '`', announce: 'grave accent, button' },
        { label: '~', announce: 'tilde, button' },
        { label: '_', announce: 'underscore, button' },
        { label: '.', announce: 'period, button' },
        { label: '-', announce: 'dash, button' },
        { label: '+', announce: 'plus sign, button' },
        { label: ':', announce: 'doublecolon, button' },
      ],
      [
        { label: 'Delete', size: 'large' },
        { label: 'Space', size: 'xlarge' },
        { label: 'Done', size: 'large' }
      ]
    ]
  },
  numbers: {
    // numbers: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
    // dialpad: [
    //   ['1', '2', '3'],
    //   ['4', '5', '6'],
    //   ['7', '8', '9'],
    //   ['', '0', '']
    // ],
    dialpadExtended: [
      ['1', '2', '3'],
      ['4', '5', '6'],
      ['7', '8', '9'],
      ['Delete', '0', 'Clear'],
      [{ label: 'Done', size: 'done_size' }]
    ]
  }
};
