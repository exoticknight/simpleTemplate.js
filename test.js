var expect = require( 'chai' ).expect;

var bare = require( './simpleTemplate.bare.js' ),
    normal = require( './simpleTemplate.normal.js' ),
    advanced = require( './simpleTemplate.advanced.js' );

var testData = {
    'text1': 'mocha tastes good, chai tastes good too.',
    'html': '<hr>',
    'list': [1, 2, 3],
    'objectList': [
        { 'name': 'a' },
        { 'name': 'b' },
        { 'name': 'c' }
    ],
    'obj': { 'name': 'obj' },
    'boolFalse': false,
    'boolTrue': true
}

describe( 'bare', function () {
    describe( 'string template', function () {
        it( 'should output correct string', function () {
            var template = bare( '<p>{=text1}</p>' );

            expect( template.fill( testData ).render() ).to.equal( '<p>mocha tastes good, chai tastes good too.</p>' );
        });
    });

    describe('html escape', function () {
        it('should treat hr tag respectively', function () {
            var template = bare( '{=html}{#html}' );

            expect( template.fill( testData ).render() ).to.equal( '&lt;hr&gt;<hr>' );
        });
    });
});

describe( 'normal', function () {
    // test on =
    describe( 'string template', function () {
        it( 'should output correct string', function () {
            var template = normal( '<p>{=text1}</p>' );

            expect( template.fill( testData ).render() ).to.equal( '<p>mocha tastes good, chai tastes good too.</p>' );
        });
    });

    // test on #
    describe( 'html escape', function () {
        it( 'should treat hr tag respectively', function () {
            var template = normal( '{=html}{#html}' );

            expect( template.fill( testData ).render() ).to.equal( '&lt;hr&gt;<hr>' );
        });
    });

    // test on .
    describe( 'dot notation', function () {
        it( 'should access data via dot', function () {
            var template = normal( '{=list.0} {=obj.name}' );

            expect( template.fill( testData ).render() ).to.equal( '1 obj' );
        });
    });

    // test on !
    describe( 'flag', function () {
        it('should recognize flag', function () {
            var template = normal( '{!boolFalse}{=boolFalse}{!}{!boolTrue}{=boolTrue}{!}' );

            expect( template.fill( testData ).render() ).to.equal( 'true' );
        });
    });

    // test on > and <
    describe( 'iterate', function () {
        it( 'should make a list', function () {
            var template = normal( '{>objectList}<li>{=*.name}</li>{<}' );

            expect( template.fill( testData ).render() ).to.equal( '<li>a</li><li>b</li><li>c</li>' );
        });
    });

    // test on @
    describe( 'embed template', function () {
        it( 'should output embeded string', function () {
            var template = normal( 'again, {@embed}' );
            var embedTmpl = normal( '{=text1}' );
            var data = JSON.parse( JSON.stringify( testData ) );;
            data.embed = embedTmpl;

            expect( template.fill( data ).render() ).to.equal( 'again, mocha tastes good, chai tastes good too.' );
        });
    });
});

describe( 'advanced', function () {
    // test on =
    describe( 'string template', function () {
        it( 'should output correct string', function () {
            var template = advanced( '<p>{=text1}</p>' );

            expect( template.fill( testData ).render() ).to.equal( '<p>mocha tastes good, chai tastes good too.</p>' );
        });
    });

    // test on #
    describe( 'html escape', function () {
        it( 'should treat hr tag respectively', function () {
            var template = advanced( '{=html}{#html}' );

            expect( template.fill( testData ).render() ).to.equal( '&lt;hr&gt;<hr>' );
        });
    });

    // test on .
    describe( 'dot notation', function () {
        it( 'should access data via dot', function () {
            var template = advanced( '{=list.0} {=obj.name}' );

            expect( template.fill( testData ).render() ).to.equal( '1 obj' );
        });
    });

    // test on !
    describe( 'flag', function () {
        it('should recognize flag', function () {
            var template = advanced( '{!boolFalse}{=boolFalse}{!}{!boolTrue}{=boolTrue}{!}' );

            expect( template.fill( testData ).render() ).to.equal( 'true' );
        });
    });

    // test on > and <
    describe( 'iterate', function () {
        it( 'should make a list', function () {
            var template = advanced( '{>objectList}<li>{=*.name}</li>{<}' );

            expect( template.fill( testData ).render() ).to.equal( '<li>a</li><li>b</li><li>c</li>' );
        });
    });

    // test on @
    describe( 'embed template', function () {
        it( 'should output embeded string', function () {
            var template = advanced( 'again, {@embed}' );
            var embedTmpl = advanced( '{=text1}' );
            var data = JSON.parse( JSON.stringify( testData ) );;
            data.embed = embedTmpl;

            expect( template.fill( data ).render() ).to.equal( 'again, mocha tastes good, chai tastes good too.' );
        });
    });

    // test on inner filter
    describe( 'inner filter', function () {
        it( 'should get the first letter and append string', function () {
            var template = advanced( '<p>{=text1|first|append "| string "}</p>' );

            expect( template.fill( testData ).render() ).to.equal( '<p>m| string </p>' );
        });
    });

    // test on custom filter
    describe( 'custom filter', function () {
        it('should ', function () {
            var template = advanced( '<p>{=text1|appendYeah}</p>');
            template.filter( 'appendYeah', function ( s ) {
                return s + ' Yeah!';
            });

            expect( template.fill( testData ).render() ).to.equal( '<p>mocha tastes good, chai tastes good too. Yeah!</p>' );
        });
    });
});