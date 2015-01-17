/*
 * simpleTemplate.regular.js
 * author: exotcknight
 * email: draco.knight0@gmail.com
 * license: MIT
 * version: 0.9.4
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

// clusure functions
var getDataViaPath = function ( path, json ) {
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

escapeHTML = function ( str ) {
    var div = document.createElement( 'div' );
    div.appendChild( document.createTextNode( str ) );
    return div.innerHTML;
},

renderTemplate = function ( template, scope, start, end ) {
    var tempFragment = '',
        strings = template.getTemplateText(),
        fields = template.getFields(),
        functions = template.getFunctions(),
        field,
        data,
        i,
        newScope;

    for ( i = start; i < end; i++ ) {
        tempFragment += strings[i];

        field = fields[i];
        data = getDataViaPath( field[1], scope );
        switch ( field[0] ) {
            case '=': // escaping data 
            tempFragment += escapeHTML( data );
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
        data = {};

    // functional variables
    var fieldPrefix = prefix ? '\\' + prefix : '\\{',
        fieldSuffix = suffix ? '\\' + suffix : '\\}',
        // /\{\s*([>|<|!|@]?)((?:[\w\d]+|\*)(?:\.[\w\d]+)*)([&]?)\s*\}/gm
        fieldRe = new RegExp( fieldPrefix + '\\s*([>|<|!|@|=|#])((?:[\\w\\d]+|\\*)(?:\\.[\\w\\d]+)*)*\\s*' + fieldSuffix, 'gm' ),
        nextLineRe = /[\r\n]/gm,
        lastIndex = 0,
        flags = [],
        loops = [],
        flag,
        loop,
        mark;

    str = OriginalStr.replace( nextLineRe, '' );

    while ( ( mark = fieldRe.exec( str ) ) !== null ) {
        /*
         * mark[0] = '{@fo.fo}', match string
         * mark[1] = '@', functional key
         * mark[2] = 'fo.fo', field's name
         */
        fields.push( [mark[1], mark[2]] );

        templateText.push( str.slice( lastIndex, fieldRe.lastIndex - mark[0].length ) );
        lastIndex = fieldRe.lastIndex;

        switch ( mark[1] ) {
            case '>':
            loops.push( fields.length-1 );
            break;

            case '<':
            // if ( loops[loops.length-1] && loops[loops.length-1][0] === mark[2] ) {
            //     loop = loops.pop();
            //     functions['loop'][loop[1]] = fields.length - 1;
            // } else {
            //     return;
            // }
            if ( loops.length > 0 ) {
                if ( flags.length === 0 || loops[loops.length-1] > flags[flags.length-1] ) {
                    functions['loop'][loops.pop()] = fields.length - 1;
                } else {
                    return;
                }
            } else {
                return;
            }
            break;

            case '!':
            if ( flags.length > 0 ) {
                if ( loops.length === 0 || flags[flags.length-1] > loops[loops.length-1] ) {
                    functions['flag'][flags.pop()] = fields.length - 1;
                } else {
                    return;
                }
            } else {
                flags.push( fields.length - 1 );
            }
            break;

            case '=':
            case '#':
            if ( !mark[2] ) {
                return;
            }

            default:
        }
    }

    templateText.push( str.slice( lastIndex, str.length ) );

    if ( flags.length !== 0 || loops.length !== 0 ) {
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
            return 'regular v0.9.4';
        }
    };
}

window.simpleTemplate = simpleTemplate;

})( window, document )