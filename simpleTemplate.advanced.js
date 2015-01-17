/*
 * simpleTemplate.advanced.js
 * author: exotcknight
 * email: draco.knight0@gmail.com
 * license: MIT
 * version: 0.3
*/
(function ( window, document, undefined ) {

// Thank you, Douglas Crockford.
if ( typeof Object.create !== 'function' ) {
    Object.create = function ( o ) {
        function F() {}
        F.prototype = o;
        return new F();
    };
}

if ( !String.prototype.trim ) {
    // Make sure we trim BOM and NBSP
    var rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g;
    String.prototype.trim = function () {
        return this.replace( rtrim, '' );
    };
}

// utils
var utils = {
    escapeHTML: function ( str ) {
        var div = document.createElement( 'div' );
        div.appendChild( document.createTextNode( str ) );
        return div.innerHTML;
    },

    date2str: function( date, format ) {
        var z = {
            'M': date.getMonth() + 1,
            'd': date.getDate(),
            'h': date.getHours(),
            'm': date.getMinutes(),
            's': date.getSeconds()
        };
        format = format.replace( /(M+|d+|h+|m+|s+)/g, function( v ) {
            return ( ( v.length > 1 ? "0" : "" ) + eval( 'z.' + v.slice( -1 ) ) ).slice( -2 );
        });
        return format.replace( /(y+)/g, function( v ) {
            return date.getFullYear().toString().slice( -v.length );
        });
    }
};

var innerFilters = {
    '==': function ( s, k ) {
        return s === k;
    },
    '!=': function ( s, k ) {
        return  s !== k;
    },
    '>': function ( s, k ) {
        return s > k;
    },
    '<': function ( s, k ) {
        return s < k;
    },
    '>=': function ( s, k ) {
        return s >= k;
    },
    '<=': function ( s, k ) {
        return s <= k;
    },
    'not': function ( s ) {
        return !s;
    },
    'where': function ( s, key ) {
        return typeof s === 'string' ? s.charAt( key ) : s[key];
    },
    'length': function ( s ) {
        return s.length;
    },
    'first': function ( s ) {
        return typeof s === 'string' ? s.charAt( 0 ) : s[0];
    },
    'last': function ( s ) {
        return typeof s ==='string' ? s.charAt( s.length - 1 ) : s[s.length-1];
    },
    'slice': function ( s ) {
        var arg = Array.prototype.slice.call( arguments, 1 );
        return Array.prototype.slice.apply( s, arg );
    },
    'prepend': function ( s, str ) {
        return str + s;
    },
    'append': function ( s, str ) {
        return s + str;
    },
    'push': function ( s, ele ) {
        return s.slice( 0 ).concat( ele );
    },
    'join': function ( s, str ) {
        return s.join( str );
    },
    'plus': function ( s, n ) {
        return s + n;
    },
    'minus': function ( s, n ) {
        return s - n;
    },
    'times': function ( s, n ) {
        return s * n;
    },
    'divided_by': function ( s, n ) {
        return s / n;
    },
    'modulo': function ( s, n ) {
        return s % n;
    },
    'replace': function ( s, str, new_str ) {
        return s.replace( new RegExp( str, 'gm' ), new_str );
    },
    'time': function ( s, format ) {
        var date = new Date();
        return format ? utils.date2str( date, format ) : date;
    },
    'newline_to_br': function ( s ) {
        return s.replace( /\r\n|\n/g, '<br>' );
    },
    'html_escape': function ( s ) {
        return utils.escapeHTML( s );
    }
};

// clusure functions
var error = function ( level, type, location, message ) {
    /*
     * @param level int, {0:statement, 1:field, 2:runtime}
     * @param type string
     * @param location {string, int}
     * @param message string
    */
    throw ( 'Error\n'
        + '[Level]\n'
        + ['statement', 'field', 'runtime'][level] + '\n\n'
        + '[Type]\n'
        + type + '\n\n'
        + '[Location]\n'
        + location + '\n\n'
        + '[Message]\n'
        + message
    );
},

getDataViaPath = function ( path, json ) {
    var fieldPath = path.split( '.' ),
        data = json,
        indexLength;

    for ( index = 0, indexLength = fieldPath.length; index < indexLength; index++ ) {
        data = data[fieldPath[index]];
        if ( data === undefined ) {
            return '';
        }
        if ( data === null ) {
            return index + 1 < indexLength ? '' : null; // maybe not necessary
        }
    }

    return typeof data === 'function' ? data.call( json/* maybe better than 'data' */ ) : data;
},

evaluateStatement = function ( obj, scope, outerFilters ) {
    var result = getDataViaPath( obj.data, scope ),
        filters = obj.filters,
        filterCount = filters.length,
        i,
        funcName,
        func;

    for ( i = 0; i < filterCount; i++ ) {
        if ( filters[i].length > 0 ) {
            funcName = filters[i][0];
            func = outerFilters && outerFilters[funcName] ? outerFilters[funcName] : innerFilters[funcName];

            if ( !func ) {
                error( 2, 'filter not found', i, funcName );
            }
            result = [result].concat( filters[i].slice( 1 ) );
            try {
                result = func.apply( scope, result );
            } catch ( e ) {
                error( 2, 'filter error', i, filters[i] + ': ' + e );
            }
        }
    }

    return result;
},

parseStatement = function ( statement ) {
    var length = statement.length,
        inQuote = false,
        inWord = false,
        statements = [],
        filter = [],
        lastIndex = 0,
        word,
        i;

    // lexical analysis
    for ( i = 0; i < length; i++ ) {
        if ( statement.charAt( i ) === '"' ) {
            if ( inQuote ) {
                word = statement.slice( lastIndex, i );  // "" is vaild
                filter.push( word );
                inWord = false;
            }
            lastIndex = i + 1;
            inQuote = !inQuote;
        } else if ( statement.charAt( i ) === ' ' ) {
            if ( inQuote ) {
                continue;
            }
            if ( inWord ) {
                word = statement.slice( lastIndex, i );
                word = isNaN( +word ) ? word : +word;
                filter.push( word );
                inWord = false;
            }
            lastIndex = i + 1;
        } else if ( statement.charAt( i ) === '|' ) {
            if ( inQuote ) {
                continue;
            }
            word = statement.slice( lastIndex, i ).trim();
            if ( word ) {
                word = isNaN( +word ) ? word : +word;
                filter.push( word );  // last word of filter
            }
            if ( filter.length !== 0 ) {
                statements.push( filter );  // end of one filter
                filter = [];
            } else {
                error( 0, 'missing filter or data', lastIndex, 'in \'' + statement + '\'' );
            }

            inWord = false;
            lastIndex = i + 1;
        } else {
            inWord = true;
        }
    }

    if ( inQuote ) {
        error( 0, 'unmatched quote', lastIndex, 'in \'' + statement + '\'' );
    }

    if ( inWord ) {
        word = statement.slice( lastIndex, i );
        word = isNaN( +word ) ? word : +word;
        filter.push( word );  // last word of filter
    }

    if ( filter.length !== 0 ) {
        statements.push( filter );  // last filter
    }

    word = statements.shift();
    word = word ? word[0] : word;

    return {
        'data': word,
        'filters': statements
    };
},

renderTemplate = function ( template, scope, start, end ) {
    var tempFragment = '',
        strings = template.getTemplateText(),
        fields = template.getFields(),
        functions = template.getFunctions(),
        filters = template.getFilters(),
        field,
        data,
        i,
        newScope;

    for ( i = start; i < end; i++ ) {
        tempFragment += strings[i];

        field = fields[i];
        data = evaluateStatement( field[1], scope, filters );
        switch ( field[0] ) {
            case '=': // escaping data 
            tempFragment += utils.escapeHTML( data );
            break;

            case '#': // raw data
            tempFragment += data;
            break;

            case '@': // internal template
            if ( data && data.fill && data.render ) {
                data.fill( scope );
                tempFragment += data.render();
            }
            break;

            case '>': // begin of list
            if ( Object.prototype.toString.call( data ) === '[object Array]' ) {
                for ( var loopIndex = 0, loopIndexLength = data.length; loopIndex < loopIndexLength; loopIndex++ ) {
                    // expend scope
                    newScope = Object.create( scope );
                    newScope['*'] = data[loopIndex];

                    // recursively render
                    tempFragment += renderTemplate( template, newScope, i + 1, functions['loop'][i] );
                }
            }

            // reset index
            i = functions['loop'][i];
            break;

            case '!': // begin of flag
            if ( data ) {
                tempFragment += renderTemplate( template, scope, i + 1, functions['flag'][i] );
            }

            // reset index
            i = functions['flag'][i];
            break;

            default:
        }
    }

    tempFragment += strings[i];

    return tempFragment;
};

var simpleTemplate = function ( OriginalStr, prefix, suffix ) {
    // private attribute
    var templateText = [],
        fields = [],
        functions = {
            'loop': {},
            'flag': {}
        },
        data = {},
        filters = {};

    // functional variables
    var fieldPrefix = prefix ? '\\' + prefix : '\\{',
        fieldSuffix = suffix ? '\\' + suffix : '\\}',
        // /\{\s*([>|<|!|@|=|#])(?:"[^"]*"|[^\{\}"]+)*\s*\}/gm
        statementRe = new RegExp( fieldPrefix + '\\s*([>|<|!|@|=|#])(?:"[^"]*"|[^\\{\\}"]+)*\\s*' + fieldSuffix, 'gm' ),
        fieldRe = /(?:[\\w\\d]+|\\*)(?:\\.[\\w\\d]+)*/g,
        nextLineRe = /\r\n|\n/gm,
        lastIndex = 0,
        flags = [],
        loops = [],
        str,
        mark,
        key,
        statement,
        field;

    str = OriginalStr.replace( nextLineRe, '' );

    while ( ( mark = statementRe.exec( str ) ) !== null ) {
        /*
         * mark[0] = '{@fo.fo}', match string
         * mark[1] = '@', functional key
         */
        key = mark[1];
        statement = mark[0].slice( 1, -1 ).trim().slice( 1 );

        field = parseStatement( statement );
        fields.push( [key, field] );

        templateText.push( str.slice( lastIndex, statementRe.lastIndex - mark[0].length ) );
        lastIndex = statementRe.lastIndex;

        switch ( key ) {
            case '>':
            loops.push( fields.length-1 );
            break;

            case '<':
            if ( loops.length > 0 ) {
                if ( flags.length === 0 || loops[loops.length-1] > flags[flags.length-1] ) {
                    functions['loop'][loops.pop()] = fields.length - 1;
                } else {
                    error( 1, 'unclosed flag', flags[flags.length-1], fields[flags[flags.length-1]][1].data );
                    return;
                }
            } else {
                error( 1, 'unclosed flag', fields.length - 1, 'no flag\'s beginning found' );
                return;
            }
            break;

            case '!':
            if ( flags.length > 0 ) {
                if ( loops.length === 0 || flags[flags.length-1] > loops[loops.length-1] ) {
                    functions['flag'][flags.pop()] = fields.length - 1;
                } else {
                    error( 1, 'unclosed loop', loops[loops.length-1], fields[loops[loops.length-1]][1].data );
                    return;
                }
            } else {
                flags.push( fields.length - 1 );
            }
            break;

            case '=':
            case '#':
            if ( !field.data ) {
                error( 1, 'missing statement', fields.length - 1, 'after ' + templateText[templateText.length-1] );
            }

            default:
        }
    }

    templateText.push( str.slice( lastIndex, str.length ) );

    if ( flags.length !== 0 || loops.length !== 0 ) {
        error( 1, 'unclosed flag or loop', -1, '' );
        return;
    }

    return {
        getTemplateText: function () {
            return templateText;
        },

        getFields: function () {
            return fields;
        },

        getFunctions: function () {
            return functions;
        },

        getData: function () {
            return data;
        },

        getFilters: function () {
            return filters;
        },

        filter: function ( name, func ) {
            if ( typeof func === 'function' ) {
                filters[name] = func;
            }
            return this;
        },

        fill: function ( jsonObj ) {
            for ( var name in jsonObj ) {
                data[name] = jsonObj[name];
            }
            return this;
        },

        reset: function () {
            data = {};
            return this;
        },

        render: function () {
            return renderTemplate( this, Object.create( this.getData() ), 0, this.getFields().length );
        },

        version: function () {
            return 'advanced v0.3';
        }
    };
}

window.simpleTemplate = simpleTemplate;

})( window, document )