/*
 * simpleTemplate.bare.js
 * author: exotcknight
 * email: draco.knight0@gmail.com
 * license: MIT
 * version: 1.2
*/
(function ( window, document, undefined ) {

var escapeHTML = function ( str ) {
    var div = document.createElement( 'div' );
    div.appendChild( document.createTextNode( str ) );
    return div.innerHTML;
},

renderTemplate = function ( template, scope, start, end ) {
    var tempFragment = '',
        strings = template.getTemplateText(),
        fields = template.getFields(),
        i;

    for ( i = start; i < end; i++ ) {
        tempFragment += strings[i];
        tempFragment += fields[i][0] === '=' ? escapeHTML( scope[fields[i][1]] ) : scope[fields[i][1]];
    }

    tempFragment += strings[i];

    return tempFragment;
};

var simpleTemplate = function ( OriginalStr, prefix, suffix ) {
    // private attribute
    var templateText = [],
        fields = [],
        data = {};

    // functional variables
    var fieldPrefix = prefix ? '\\' + prefix : '\\{',
        fieldSuffix = suffix ? '\\' + suffix : '\\}',
        fieldRe = new RegExp( fieldPrefix + '\\s*(=|#)([\\w\\d]+)?\\s*' + fieldSuffix, 'gm' ),
        nextLineRe = /[\r\n]/gm,
        lastIndex = 0,
        mark;

    str = OriginalStr.replace( nextLineRe, '' );

    while ( ( mark = fieldRe.exec( str ) ) !== null ) {
        /*
         * mark[0] = '{=fo.fo}'
         * mark[1] = '='
         * mark[2] = 'fo.fo'
         */
        fields.push( [mark[1], mark[2]] );

        templateText.push( str.slice( lastIndex, fieldRe.lastIndex - mark[0].length ) );
        lastIndex = fieldRe.lastIndex;
    }

    templateText.push( str.slice( lastIndex, str.length ) );

    return {
        getTemplateText: function () {
            return templateText;
        },

        getFields: function () {
            return fields;
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
            return renderTemplate( this, this.getData(), 0, this.getFields().length );
        },

        version: function () {
            return 'bare v1.2';
        }
    };
}

window.simpleTemplate = simpleTemplate;

})( window, document )