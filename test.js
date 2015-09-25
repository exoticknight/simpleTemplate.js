var expect = require( 'chai' ).expect;

var bare = require( './simpleTemplate.bare.js' ),
    normal = require( './simpleTemplate.normal.js' ),
    advanced = require( './simpleTemplate.advanced.js' );

var testData = {
    'text1': 'mocha tastes good, chai tastes good too.',
    'num': 4,
    'birthday': 689788800000,
    'html': '<hr>',
    'mutilline': 'first\nsecond',
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
    // test reset
    describe( '#reset()', function () {
        it( 'should wipe out all data', function () {
            var template = bare( '{=text1}' );

            expect( template.fill( testData ).render() ).to.equal( 'mocha tastes good, chai tastes good too.' );

            expect( template.reset().render() ).to.equal( '' );
        });
    });

    // test on =
    describe( 'string template', function () {
        it( 'should output correct string', function () {
            var template = bare( '<p>{=text1}</p>' );

            expect( template.fill( testData ).render() ).to.equal( '<p>mocha tastes good, chai tastes good too.</p>' );
        });
    });

    // test on #
    describe('html escape', function () {
        it('should treat hr tag respectively', function () {
            var template = bare( '{=html}{#html}' );

            expect( template.fill( testData ).render() ).to.equal( '&lt;hr&gt;<hr>' );
        });
    });
});

describe( 'normal', function () {
    // test reset
    describe( '#reset()', function () {
        it( 'should wipe out all data', function () {
            var template = normal( '{=text1}' );

            expect( template.fill( testData ).render() ).to.equal( 'mocha tastes good, chai tastes good too.' );

            expect( template.reset().render() ).to.equal( '' );
        });
    });

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
    // test reset
    describe( '#reset()', function () {
        it( 'should wipe out all data', function () {
            var template = advanced( '{=text1}' );

            expect( template.fill( testData ).render() ).to.equal( 'mocha tastes good, chai tastes good too.' );

            expect( template.reset().render() ).to.equal( '' );
        });
    });

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
        // ==
        it( '4 == 4 should be true', function () {
            var template = advanced( '{=num|== 4}' );

            expect( template.fill( testData ).render() ).to.equal( 'true' );
        });
        it( '4 == 5 should be false', function () {
            var template = advanced( '{=num|== 5}' );

            expect( template.fill( testData ).render() ).to.equal( 'false' );
        });

        // !=
        it( '4 != 3 should be true', function () {
            var template = advanced( '{=num|!= 3}' );

            expect( template.fill( testData ).render() ).to.equal( 'true' );
        });
        it( '4 != 4 should be false', function () {
            var template = advanced( '{=num|!= 4}' );

            expect( template.fill( testData ).render() ).to.equal( 'false' );
        });

        // >
        it( '4 > 3 should be true', function () {
            var template = advanced( '{=num|> 3}' );

            expect( template.fill( testData ).render() ).to.equal( 'true' );
        });
        it( '4 > 5 should be false', function () {
            var template = advanced( '{=num|> 5}' );

            expect( template.fill( testData ).render() ).to.equal( 'false' );
        });

        // <
        it( '4 < 5 should be true', function () {
            var template = advanced( '{=num|< 5}' );

            expect( template.fill( testData ).render() ).to.equal( 'true' );
        });
        it( '4 < 3 should be false', function () {
            var template = advanced( '{=num|< 3}' );

            expect( template.fill( testData ).render() ).to.equal( 'false' );
        });

        // >=
        it( '4 >= 4 should be true', function () {
            var template = advanced( '{=num|>= 4}' );

            expect( template.fill( testData ).render() ).to.equal( 'true' );
        });
        it( '4 >= 5 should be false', function () {
            var template = advanced( '{=num|>= 5}' );

            expect( template.fill( testData ).render() ).to.equal( 'false' );
        });

        // <=
        it( '4 <= 4 should be true', function () {
            var template = advanced( '{=num|<= 4}' );

            expect( template.fill( testData ).render() ).to.equal( 'true' );
        });
        it( '4 <= 3 should be false', function () {
            var template = advanced( '{=num|<= 3}' );

            expect( template.fill( testData ).render() ).to.equal( 'false' );
        });

        // not
        it( 'not true gives me false', function () {
            var template = advanced( '{=boolTrue|not}' );

            expect( template.fill( testData ).render() ).to.equal( 'false' );
        });

        // where
        it( 'where is the name?', function () {
            var template = advanced( '{=obj|where "name"}' );

            expect( template.fill( testData ).render() ).to.equal( 'obj' );
        });

        // first
        it( 'should get the first letter', function () {
            var template = advanced( '<p>{=text1|first}</p>' );

            expect( template.fill( testData ).render() ).to.equal( '<p>m</p>' );
        });

        // last
        it( 'should get the last letter', function () {
            var template = advanced( '{=text1|last}' );

            expect( template.fill( testData ).render() ).to.equal( '.' );
        });

        // length
        it( 'should get the length of string', function () {
            var template = advanced( '{=text1|length}' );

            expect( template.fill( testData ).render() ).to.equal( '40' );
        });

        // slice
        it( 'should get the length of string', function () {
            var template = advanced( '{=list|slice 1}' );

            expect( template.fill( testData ).render() ).to.equal( '2,3' );
        });

        // prepend
        it( 'should prepend "again, "', function () {
            var template = advanced( '{=text1|prepend "again, "}' );

            expect( template.fill( testData ).render() ).to.equal( 'again, mocha tastes good, chai tastes good too.' );
        });

        // append
        it( 'should append "Yeah"', function () {
            var template = advanced( '{=text1|append "Yeah"}' );

            expect( template.fill( testData ).render() ).to.equal( 'mocha tastes good, chai tastes good too.Yeah' );
        });

        // push
        it( 'push 4 should get a new array of [1,2,3,4]', function () {
            var template = advanced( '{=list|push 4}' );

            expect( template.fill( testData ).render() ).to.equal( '1,2,3,4' );
        });

        // join
        it( 'should get 1-2-3', function () {
            var template = advanced( '{=list|join "-"}' );

            expect( template.fill( testData ).render() ).to.equal( '1-2-3' );
        });

        // plus
        it( '4 + 1 should equal 5', function () {
            var template = advanced( '{=num|plus 1}' );

            expect( template.fill( testData ).render() ).to.equal( '5' );
        });

        // minus
        it( '4 - 2 should equal 2', function () {
            var template = advanced( '{=num|minus 2}' );

            expect( template.fill( testData ).render() ).to.equal( '2' );
        });

        // times
        it( '4 * 2 should equal 8', function () {
            var template = advanced( '{=num|times 2}' );

            expect( template.fill( testData ).render() ).to.equal( '8' );
        });

        // divided_by
        it( '4 / 2 should equal 2', function () {
            var template = advanced( '{=num|divided_by 2}' );

            expect( template.fill( testData ).render() ).to.equal( '2' );
        });

        // modulo
        it( '4 mod 3 should equal 1', function () {
            var template = advanced( '{=num|modulo 3}' );

            expect( template.fill( testData ).render() ).to.equal( '1' );
        });

        // replace
        it( 'should tastes bad', function () {
            var template = advanced( '{=text1|replace "good" "bad"}' );

            expect( template.fill( testData ).render() ).to.equal( 'mocha tastes bad, chai tastes bad too.' );
        });

        // time
        it( 'should output the date when I was born', function () {
            var template = advanced( '{=birthday|time "yyyy-MM-dd"}' );

            expect( template.fill( testData ).render() ).to.equal( '1991-11-11' );
        });

        // newline
        it( 'should turn \\n into <br>', function () {
            var template = advanced( '{#mutilline|newline_to_br}' );

            expect( template.fill( testData ).render() ).to.equal( 'first<br>second' );
        });

        // excape
        it( 'should escape string', function () {
            var template = advanced( '{#html|html_escape}' );

            expect( template.fill( testData ).render() ).to.equal( '&lt;hr&gt;' );
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