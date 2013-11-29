/// Copyright 2013, Andrew Leaver-Fay

function strip_whitespace( str ) {
    return str.replace(/^\s+|\s+$/g,'');
}

function newFilledArray( len, val ) {
    var newarray = [];
    for ( var i=0; i < len; ++i ) {
        newarray[i] = val;
    }
    return newarray;
}
        
function binBoolString( val ) {
    if ( val ) { return "1"; }
    return "0";
}


// A = 0, C = 1, G = 2, T = 3
// codon = TCG --> 3*16 + 1*4 + 2 = 54
function GeneticCodeMapper() {
    var gcm = {};

    function init( gcm ) {
        gcm.base_to_index = { "A" : 0, "C" : 1, "G" : 2, "T" : 3 };
        gcm.aastring = "ACDEFGHIKLMNPQRSTVWY";
        gcm.aamap = {} // map from the 1 letter code or the "STOP" string to an index
        for ( var i=0; i < gcm.aastring.length; ++i ) {
            gcm.aamap[ gcm.aastring.charAt(i) ] = i;
        }
        gcm.aamap[ "STOP" ] = 20;
        gcm.codons = {
            "TTT" : "F",
            "TTC" : "F",
            "TTA" : "L",
            "TTG" : "L",
            "CTT" : "L",
            "CTC" : "L",
            "CTA" : "L",
            "CTG" : "L",
            "ATT" : "I",
            "ATC" : "I",
            "ATA" : "I",
            "ATG" : "M",
            "GTT" : "V",
            "GTC" : "V",
            "GTA" : "V",
            "GTG" : "V",
            "TCT" : "S",
            "TCC" : "S",
            "TCA" : "S",
            "TCG" : "S",
            "CCT" : "P",
            "CCC" : "P",
            "CCA" : "P",
            "CCG" : "P",
            "ACT" : "T",
            "ACC" : "T",
            "ACA" : "T",
            "ACG" : "T",
            "GCT" : "A",
            "GCC" : "A",
            "GCA" : "A",
            "GCG" : "A",
            "TAT" : "Y",
            "TAC" : "Y",
            "TAA" : "STOP",
            "TAG" : "STOP",
            "CAT" : "H",
            "CAC" : "H",
            "CAA" : "Q",
            "CAG" : "Q",
            "AAT" : "N",
            "AAC" : "N",
            "AAA" : "K",
            "AAG" : "K",
            "GAT" : "D",
            "GAC" : "D",
            "GAA" : "E",
            "GAG" : "E",
            "TGT" : "C",
            "TGC" : "C",
            "TGA" : "STOP",
            "TGG" : "W",
            "CGT" : "R",
            "CGC" : "R",
            "CGA" : "R",
            "CGG" : "R",
            "AGT" : "S",
            "AGC" : "S",
            "AGA" : "R",
            "AGG" : "R",
            "GGT" : "G",
            "GGC" : "G",
            "GGA" : "G",
            "GGG" : "G" };

        gcm.mapper = [];
        for ( var codon in gcm.codons ) {
            if ( gcm.codons.hasOwnProperty(codon) ) {
                var aastr = gcm.codons[ codon ];
                var ci = gcm.codon_index( codon );
                var aaind =  gcm.aamap[ aastr ];
                gcm.mapper[ ci ] = aaind;
            }
        }
    }

    gcm.codon_index = function( codon ) {
        var index = 0;
        for ( var i=0; i < 3; ++i ) {
            index = index*4 + this.base_to_index[ codon[i] ];
        }
        return index;
    };

    gcm.aastr_for_integer = function ( aaindex ) {
        if ( aaindex >= 0 && aaindex < 20 ) {
            return this.aastring.charAt( aaindex );
        } else {
            if ( aaindex != 20 ) {
                alert( "Error in aastr_for_integer: given integer index of " + aaindex + " which is out of range!" );
            }
            return "STOP";
        }
    };


    init( gcm );
    return gcm;
}

function LexicographicalIterator( dims ) {
    var lex = {}
    function initialize ( lex ) {
        lex.size = dims.length;
        lex.dimsizes = dims.slice(0);
        lex.dimprods = [];
        lex.dimprods[lex.size-1] = 1;
        for ( var i = lex.size - 1; i >= 0; --i ) {
            lex.dimprods[i-1] = lex.dimprods[i]*lex.dimsizes[i];
        }
        lex.search_space_size = lex.dimprods[0]*lex.dimsizes[0];
        lex.pos = [];
        //alert( lex.size );
        for ( var i = 0; i < lex.size; ++i ) { lex.pos[i] = 0 }
        lex.at_end = false;
    };

    initialize( lex );

    lex.increment = function () {
        var i = this.size;
        while ( i > 0 ) {
            i = i-1;
            this.pos[ i ] = this.pos[ i ] + 1;
            if ( this.pos[ i ] === this.dimsizes[ i ] ) {
                this.pos[ i ] = 0;
            } else {
                return true;
            }
        }
        this.at_end = true
        return false
    };

    lex.upper_diagonal_increment = function () {
        for ( var i = lex.size - 1; i >= 0; --i ) {
            lex.pos[ i ] += 1;
            if ( lex.pos[ i ] === lex.dimsizes[ i ] ) {
                lex.pos[ i ] = 0;
            } else {
                var beyond_end = false;
                for ( var k = i+1; k < lex.size; ++k )  {
                    lex.pos[ k ] = lex.pos[ i ] + k - i;
                    if ( lex.pos[ k ] >= lex.dimsizes[ k ] ) {
                        beyond_end = true;
                        break;
                    }
                }
                if ( beyond_end && i == 0 ) {
                    for ( var k = 0; k < lex.size; ++k ) {
                        lex.pos[ k ] = 0;
                    }
                    lex.at_end = true;
                    return false;
                } else if ( ! beyond_end ) {
                    return true;
                }
            }
        }
        lex.at_end = true;
        return false;
    }


    lex.reset = function() {
        for ( var i=0; i < this.size; ++i ) {
            this.pos[ i ] = 0;
        }
        this.at_end = false;
    };

    // if you want to iterate across only the values of the lex s.t.
    // pos[i] < pos[j] for all j > i, then initialize the lex with
    // this function, and increment it with the increment_upper_diagonal
    // function.
    lex.upper_diagonal_reset = function() {
        var beyond_end = false;
        for ( var i=0; i < this.size; ++i ) {
            this.pos[ i ] = i;
            if ( i > this.dimsizes[ i ] ) { beyond_end = true; }
        }
        if ( beyond_end ) {
            for ( var i=0; i < this.size; ++i ) { this.pos[i] = 0; }
            this.at_end = true;
        } else {
            this.at_end = false;
        }
    }

    lex.index = function() {
        // return the integer index representing the state of the lex
        var ind = 0;
        for ( var i=0; i < this.size; ++i ) {
            ind += this.pos[ i ] * this.dimprods[ i ];
        }
        return ind;
    };

    lex.set_from_index = function ( ind ) {
        // set the state of the lex given a previously computed index
        for ( var i=0; i < this.size; ++i ) {
            this.pos[ i ] = Math.floor( ind / this.dimprods[i] );
            ind = ind % this.dimprods[ i ];
        }
        this.at_end = false;
    };

    return lex;
}

function DegenerateCodon()  {
    var dc = {};

    function init( dc ) {
        dc.infinity = -1; // for log diversity
        dc.pos = [ [ false, false, false, false ], [ false, false, false, false ], [ false, false, false, false ]  ] ;
        dc.which = [ [], [], [] ];
        dc.count_pos = [ 0, 0, 0 ];
        dc.degenerate_base_names = {
            "1000" : "A",
            "0100" : "C",
            "0010" : "G",
            "0001" : "T",
            "1001" : "W",
            "0110" : "S",
            "1100" : "M",
            "0011" : "K",
            "1010" : "P",
            "0101" : "Y",
            "0111" : "B",
            "1011" : "D",
            "1101" : "H",
            "1110" : "V",
            "1111" : "N"
        };
    }
    init( dc );

    dc.codon_string = function() {
        var output_codon_string = "";
        for ( var i=0; i < 3; ++i ) {
            var idcpos = this.pos[i];
            var base_tuple = []
            for ( var j=0; j < 4; ++j ) {
                base_tuple[j] = binBoolString( idcpos[j] );
            }
            output_codon_string += this.degenerate_base_names[ base_tuple.join("") ];
        }
        return output_codon_string;
    };


    dc.set_pos = function ( codon_pos, base ) {
        if ( ! this.pos[ codon_pos ][ base ] ) {
            this.which[ codon_pos ].push( base );
            this.pos[ codon_pos ][ base ] = true;
            this.count_pos[ codon_pos ] += 1;
            //console.log( "set_pos: " + codon_pos + " " + base + " which: " + this.which.join(",") + " pos " + this.pos.join(",") + " count_pos " + this.count_pos.join(",") );
        }
    };

    dc.reset = function() {
        for ( var i = 0; i < 3; ++i ) {
            this.which[i].length = 0;
            this.count_pos[i] = 0;
            for ( var j=0; j < 4; ++j ) {
                this.pos[i][j] = false;
            }
        }
    };

    dc.diversity = function () {
        for ( var i=0; i < 3; ++i ) {
            if ( this.count_pos[i] === 0 ) {
                return this.infinity;
            }
        }
        var div = 1;
        for ( var i=0; i < 3; ++i ) {
            div *= this.count_pos[i];
        }
        return div;
    };

    dc.log_diversity = function () {
        for ( var i=0; i < 3; ++i ) {
            if ( this.count_pos[i] === 0 ) {
                return this.infinity;
            }
        }
        var ld = 0.0;
        for ( var i=0; i < 3; ++i ) {
            ld += Math.log( this.count_pos[i] );
            //console.log( i + " ld: " + ld );
        }
        return ld;
    };

    dc.index_from_lex = function( lex ) {
        // Get the index for a particular codon using a lexicographical iterator
        // that's dimensioned from this.count_pos
        var codon_index = 0;
        for ( var i=0; i < 3; ++i ) {
            codon_index = codon_index * 4 + this.which[i][lex.pos[i]];
        }
        return codon_index;
    };

    dc.set_from_lex = function ( lex ) {
        // Set the state for this degenerate codon using a lex that's iterating over all (2**4-1)**3 = 3375 codon options.
        this.reset();
        for ( var i=0; i < 3; ++i ) {
            var posi = lex.pos[i]+1; // take "14" to mean "all 4 degenerate codons" and "0" to mean "only A"
            var sigdig = 8;
            for ( var j=0; j < 4; ++j ) {
                if ( Math.floor( posi / sigdig ) != 0 ) {
                    this.set_pos( i, 3-j ); // so A = 0 and T = 3
                }
                posi = posi % sigdig;
                sigdig = Math.floor( sigdig / 2 );
            }
            //console.log( "set from lex: " + this.pos.join(",") + " and count_pos: " + this.count_pos.join(",") )
        }
    }
    return dc;
}


function AALibrary() {
    var library = {};
    
    function init( library ) {
        library.infinity = -1.0;
        library.gcmapper = GeneticCodeMapper();
        library.max_dcs_per_pos = 2;
        library.max_extra_primers = 2;
    }
    init( library );

    // in python, it's efficient to return an array of booleans; it's probably less
    // efficient to do so in javascript
    library.aas_for_degenerate_codon = function( degenerate_codon ) {
        aas = newFilledArray( 21, false );
        lex = LexicographicalIterator( degenerate_codon.count_pos )
        while ( ! lex.at_end ) {
            codon_index = degenerate_codon.index_from_lex( lex );
            aas[ this.gcmapper.mapper[ codon_index ] ] = true;
            lex.increment();
        }
        return aas;
    };

    library.enumerate_aas_for_all_degenerate_codons = function() {
        if ( this.hasOwnProperty( "aas_for_dc" ) ) {
            // initialize this only once
            return;
        }

        var dims = [ 15, 15, 15 ];
        this.aas_for_dc = [];
        this.diversities_for_dc = [];
        this.dclex = LexicographicalIterator( dims );
        var dc = DegenerateCodon();
        this.dclex.reset();
        while ( ! this.dclex.at_end ) {
            dc.set_from_lex( this.dclex );
            var lexind = this.dclex.index();
            this.aas_for_dc[ lexind ] = this.aas_for_degenerate_codon( dc );
            this.diversities_for_dc[ lexind ] = dc.diversity();
            this.dclex.increment();
        }
    }

    //format should be a table with N columns and 21 rows
    // row 1 is a header, which just gives the sequence positions
    // row 2 defines primer boundaries
    // row 3 gives the maximum number of DCs for each position
    // column 1 gives the amino acid names
    // row1/column1 gives nothing
    // all other row/column combinations should be integers
    library.load_library = function( csv_contents ) {        
        var lines = csv_contents.split("\n");
        row1 = lines[0].split(",");
        this.n_positions = row1.length-1;
        this.aa_counts = [];
        this.required = [];
        this.forbidden = [];
        this.primer_reps = newFilledArray( this.n_positions, 0 );
        this.max_dcs_for_pos = newFilledArray( this.n_positions, 1 );
        for ( var i=0; i < this.n_positions; ++i ) {
            this.aa_counts[ i ] = newFilledArray( 21, 0 );
            this.required[ i ]  = newFilledArray( 21, false );
            this.forbidden[ i ] = newFilledArray( 21, false );
        }
        this.orig_pos = [];
        for ( var i=1; i < row1.length; ++i ) {
            this.orig_pos[i-1] = strip_whitespace( row1[i] )
        }

        var row2 = lines[1];
        var row2cols = row2.split(",").slice(1);
        var last_rep = 0;
        for ( var i=0; i < this.n_positions; ++i ) {
            if ( row2cols[i] === "|" ) {
                last_rep = i;
            }
            this.primer_reps[i] = last_rep;
        }

        var row3 = lines[2];
        var row3cols = row3.split(",").slice(1);
        this.max_dcs_per_pos = 1;
        for ( var i=0; i < this.n_positions; ++i ) {
            this.max_dcs_for_pos[i] = parseInt( row3cols[i] );
            if ( this.max_dcs_for_pos[i] > this.max_dcs_per_pos ) {
                this.max_dcs_per_pos = this.max_dcs_for_pos[i];
            }
        }

        this.max_per_position_error = 0;
        var obs_count = newFilledArray( this.n_positions, 0 );
        for ( var i=0; i < 21; ++i ) {
            var line = lines[ i + 3 ];
            var vals = line.split(",").slice(1);
            var iiobs = 0;
            for ( var j=0; j < vals.length; ++j ) {
                var ijval = vals[j];
                if ( ijval === "*" ) {
                    //required!
                    this.required[j][i] = true;
                } else if ( ijval === "!" ) {
                    // forbidden
                    this.forbidden[j][i] = true;
                } else {
                    var ij_int = parseInt(ijval);
                    this.aa_counts[j][i] = ij_int;
                    obs_count[j] += Math.abs( ij_int );
                }
            }
            console.log( vals.join(", ") );
        }
        for ( var i=0; i < this.n_positions; ++i ) { 
            if ( obs_count[i] > this.max_per_position_error ) {
                this.max_per_position_error = obs_count[i];
            }
        }

    };

    // Returns the error for a given set of amino acids.
    // Returns this.infinity if one of the required amino
    // acids is missing or if a forbidden amino acid is present
    library.error_given_aas_for_pos = function( pos, aas ) {
        var error = 0;
        for ( var i=0; i < 21; ++i ) {
            var icount = this.aa_counts[ pos ][ i ];
            if ( ! aas[ i ] ) {
                if ( this.required[ pos ][ i ] ) {
                    return this.infinity;
                }
                if ( icount > 0 ) {
                    error += icount;
                }
            } else {
                if ( this.forbidden[ pos ][ i ] ) {
                    return this.infinity;
                }
                if ( icount < 0 ) {
                    error -= icount;
                }
            }
        }
        return error;
    };

    library.find_useful_codons = function() {
        var that = this;
        function useful_aaind_for_pos( aas, pos ) {
            var aaind = 0;
            for ( var i = 0; i < 21; ++i ) {
                aaind = 2 * aaind + ( aas[i] && that.aa_counts[ pos ][ i ] > 0 ? 1 : 0 );
            }
            return aaind;
        }
        this.useful_codons = [];
        var div_for_codons = []
        for ( var i = 0; i < this.n_positions; ++i ) {
            this.useful_codons[i] = [];
            div_for_codons[i] = []
        }
        for ( var i = 0; i < 3375; ++i ) {
            var iaas = this.aas_for_dc[ i ];
            var idiv = this.diversities_for_dc[ i ];
            for ( var j = 0; j < this.n_positions; ++j ) {
                var ijerror = this.error_given_aas_for_pos( j, iaas );
                if ( ijerror === this.infinity ) continue;
                var ij_aaind = useful_aaind_for_pos( iaas, j );
                if ( ! div_for_codons[j].hasOwnProperty( ijerror ) ||
                     ! div_for_codons[j][ijerror ].hasOwnProperty( ij_aaind ) ||
                     div_for_codons[j][ijerror][ij_aaind][0] > idiv ) {
                    if ( ! div_for_codons[j].hasOwnProperty( ijerror ) ) {
                        div_for_codons[j][ ijerror ] = [];
                    }
                    div_for_codons[j][ ijerror ][ ij_aaind ] = [ idiv, i ];
                }
            }
        }
        for ( var i = 0; i < this.n_positions; ++i ) {
            for ( var j in div_for_codons[i] ) {
                if ( ! div_for_codons[i].hasOwnProperty( j ) ) continue;
                var jaainds = div_for_codons[i][j];
                for ( var k in jaainds ) {
                    if ( ! jaainds.hasOwnProperty( k ) ) continue;
                    this.useful_codons[i].push( jaainds[k][1] );
                }
            }
        }
    };

    library.report_useful_codon_fraction = function() {
        // library.find_useful_codons must have been called first!
        var dc = DegenerateCodon();
        var lex = LexicographicalIterator( [ 15, 15, 15 ] );
        for ( var i = 0; i < this.n_positions; ++i ) {
            var iuseful = [ "Position ", this.orig_pos[i], " with ", this.useful_codons[i].length ];
            iuseful.push( " useful codons of 3375 ( " + (this.useful_codons[i].length / 3375) + "% )" );
            console.log( iuseful.join(" ") );
            codons = []
            for ( var j=0; j < this.useful_codons[i].length; ++j ) {
                lex.set_from_index( this.useful_codons[i][j] );
                dc.set_from_lex( lex );
                codons.push( dc.codon_string() + "(" + this.useful_codons[i][j] + "," + j + ")" );
            }
            codons.sort();
            console.log( "Useful codons: " +  codons.join(", ") );
        }
    };

    library.compute_smallest_diversity_for_all_errors_given_n_deg_codons_sparse = function() {
        var that = this;
        function codon_inds_from_useful_codon_lex( position, useful_codon_lex  ) {
            var inds = [];
            for ( var i=0; i < useful_codon_lex.pos.length; ++i ) {
                inds[i] = that.useful_codons[position][ useful_codon_lex.pos[i] ];
            }
            return inds;
        }
        
        this.enumerate_aas_for_all_degenerate_codons();
        this.find_useful_codons();

        this.divmin_for_error_for_n_dcs_sparse = [];
        this.codons_for_error_for_n_dcs_sparse = [];
        for ( var i=0; i < this.n_positions; ++i ) {
            this.divmin_for_error_for_n_dcs_sparse[i] = [];
            this.codons_for_error_for_n_dcs_sparse[i] = [];
            for ( var j=0; j < this.max_dcs_for_pos[i]; ++j ) {
                this.divmin_for_error_for_n_dcs_sparse[i][j] = newFilledArray( this.max_per_position_error, this.infinity );
                this.codons_for_error_for_n_dcs_sparse[i][j] = newFilledArray( this.max_per_position_error, this.infinity );
            }
        }
        var aas_for_combo = newFilledArray( 21, false );
        for ( var i=0; i < this.n_positions; ++i ) {
            for ( var j=1; j <= this.max_dcs_for_pos[i]; ++j ) {
                var dims = [];

                for ( var k=0; k < j; ++k ) {
                    dims[k] = this.useful_codons[i].length;
                }
                var jlex = LexicographicalIterator( dims );
                jlex.upper_diagonal_reset();
                while ( ! jlex.at_end ) {

                    // assemble the codons; compute their diversity
                    for ( var k=0; k < 21; ++k ) aas_for_combo[k] = false;
                    var diversity = 0;
                    for ( var k=0; k < j; ++k ) {
                        var kcodon = this.useful_codons[i][ jlex.pos[k] ];
                        diversity += this.diversities_for_dc[ kcodon ];
                        var kaas = this.aas_for_dc[ kcodon ];
                        for ( var l=0; l < 21; ++l ) {
                            aas_for_combo[l] = aas_for_combo[l] || kaas[l];
                        }
                    }
                    var log_diversity = Math.log( diversity );

                    var error = this.error_given_aas_for_pos( i, aas_for_combo );
                    if ( error !== this.infinity ) {
                        var prev_diversity = this.divmin_for_error_for_n_dcs_sparse[i][j-1][error];
                        if ( prev_diversity === this.infinity || prev_diversity > log_diversity ) {
                            this.divmin_for_error_for_n_dcs_sparse[ i ][ j-1 ][ error ] = log_diversity;
                            this.codons_for_error_for_n_dcs_sparse[ i ][ j-1 ][ error ] = codon_inds_from_useful_codon_lex( i, jlex );
                        }
                    }
                    jlex.upper_diagonal_increment();
                }
            }
        }
    }


    library.compute_smallest_diversity_for_all_errors = function () {
        this.divmin_for_error = [];
        this.codon_for_error = [];
        this.errors_for_position = [];
        for ( var i=0; i < this.n_positions; ++i ) {
            this.divmin_for_error[i] = [];
            this.codon_for_error[i]  = [];
            this.errors_for_position[i] = [];
            for ( var j=0; j <= this.max_per_position_error; ++j ) {
                this.divmin_for_error[i][j] = this.infinity;
                this.codon_for_error[i][j]  = 0;
            }
        }
        var dims = [ 15, 15, 15 ];
        this.dclex = LexicographicalIterator( dims );
        var dc = DegenerateCodon();
        this.dclex.reset();
        while ( ! this.dclex.at_end ) {
            dc.set_from_lex( this.dclex );
            var aas = this.aas_for_degenerate_codon( dc );
            for ( var i=0; i < this.n_positions; ++i ) {
                var error = this.error_given_aas_for_pos( i, aas );
                if ( error !== this.infinity ) {
                    var log_diversity = dc.log_diversity();
                    var prev_diversity = this.divmin_for_error[ i ][ error ];
                    //console.log( "position " + i + " error " + error + " diversity: " + log_diversity );
                    if ( log_diversity !== dc.infinity && ( prev_diversity === this.infinity || log_diversity < prev_diversity )) {
                        // store the diversity and information on the degenerate codon that
                        // produced this level of error
                        this.divmin_for_error[i][ error ] = log_diversity;
                        this.codon_for_error[i][ error ]  = this.dclex.index();
                    }
                }
            }
            this.dclex.increment();
        }
        for ( var i=0; i < this.n_positions; ++i ) {
            this.errors_for_position[i].sort( function(a,b){return a-b} );
        }
    }

    library.find_positions_wo_viable_solutions = function() {
        var pos_w_no_viable_solutions = []
        for ( var i=0; i < this.n_positions; ++i ) {
            var ok = false;
            for ( var j=0; j < this.max_per_position_error; ++j ) {
                if ( this.divmin_for_error[i][j] !== this.infinity ) {
                    ok = true;
                    break;
                }
            }
            if ( ! ok ) {
                pos_w_no_viable_solutions.push( i );
            }
        }
        return pos_w_no_viable_solutions;   
    }

                
    library.optimize_library = function() {

        //Run a dynamic programming algorithm to determine the minimum diversity for
        //every error level, and return an array of error levels for each position
        //that describes the library that fits under the diversity cap with the smallest
        //error.  This array can be used with the previously-computed divmin_for_error
        //array to figure out which codons should be used at every position.

        this.error_span = this.max_per_position_error * this.n_positions;

        //assert( hasattr( self, 'divmin_for_error' ) )
        this.dp_divmin_for_error = []
        // dp_traceback is an array of tuples:
        //  pos0 = which error level ( from this.divmin_for_error ) for this position
        //  pos1 = which error total ( from this.dp_divmin_for_error ) for the previous position
        this.dp_traceback = []
        for ( var i=0; i < this.n_positions; ++i ) {
            this.dp_divmin_for_error[i] = [];
            this.dp_traceback[i] = [];
            //for ( var j=0; j <= this.error_span; ++j ) {
            //    this.dp_divmin_for_error[i][j] = this.infinity;
            //    this.dp_traceback[i][j] = [ this.infinity, this.infinity  ];
            //}
        }

        // take care of position 0: copy this.divmin_for_error[0] into this.dp_divmin_for_eror
        for ( var i=0; i<= this.max_per_position_error; ++i ) {
            if ( this.divmin_for_error[0][i] != this.infinity ) {
                this.dp_divmin_for_error[0][i] = this.divmin_for_error[0][i];
                this.dp_traceback[0][i]        = [ i, 0 ];
            }
        }

        for ( var i=1; i < this.n_positions; ++i ) {
            // solve the dynamic programming problem for residues 0..i
            var i_errors = this.errors_for_position[i];
            var i_num_errors = i_errors.length;
            var iprev_dp_divmin_for_error = this.dp_divmin_for_error[ i-1 ];
            var idivmin_for_error = this.divmin_for_error[i]
            for ( var j=0; j <= this.error_span; ++j ) {
                var j_divmin = this.infinity;
                var j_traceback = this.infinity;
                for ( var k=0; k < i_num_errors; ++k ) {
                    var kerror = i_errors[k];
                    if ( kerror > j ) break;
                    var iprev_error = iprev_dp_divmin_for_error[j-kerror];
                    if ( iprev_error === undefined ) continue;

                    var divsum = idivmin_for_error[kerror] + iprev_error;
                    if ( j_divmin === this.infinity || divsum < j_divmin ) {
                        j_divmin = divsum;
                        j_traceback = kerror;
                    }
                }
                if ( j_divmin !== this.infinity ) {
                    this.dp_divmin_for_error[i][j] = j_divmin;
                    this.dp_traceback[i][j] = [ j_traceback, j-j_traceback ];
                }
            }
        }
    }

    library.errors_in_diversity_range = function ( diversity_upper_bound, diversity_lower_bound ) {
        var errors_in_range = [];
        var log_ub = Math.log( diversity_upper_bound );
        var log_lb = Math.log( diversity_lower_bound );
        var last_row = this.dp_divmin_for_error[ this.n_positions - 1 ];
        for ( var i=0; i < this.error_span; ++i ) {
            if ( last_row[ i ] < log_ub && last_row[ i ] > log_lb ) {
                errors_in_range.push( i );
            }
        }
        return errors_in_range;
    }

    library.find_minimal_error_beneath_diversity_cap = function( diversity_cap ) {
        var log_diversity_cap =  Math.log( diversity_cap );

        //for i in xrange( this.error_span ) :
        //    if this.dp_divmin_for_error[-1][i] != this.infinity :
        //        print "Error of",i,"requires diversity of %5.3f" % this.dp_divmin_for_error[-1][i]

        for ( var i=0; i <= this.error_span; ++i ) {
            if ( this.dp_divmin_for_error[ this.n_positions-1 ][i] != this.infinity && this.dp_divmin_for_error[ this.n_positions-1 ][i] < log_diversity_cap ) {
                return i;
            }
        }
    };

    library.traceback = function( diversity_cap ) {
        // now the traceback
        var least_error = this.find_minimal_error_beneath_diversity_cap( diversity_cap );
        return this.traceback_from_error_level( least_error );
    };

    library.traceback_from_error_level = function( error_level ) {
        var error_traceback = [];
        for ( var i=0; i < this.n_positions; ++i ) { error_traceback[i] = 0; }

        var position_error = []
        for ( var i=0; i < this.n_positions; ++i ) { position_error[i] = 0; }
        for ( var i=this.n_positions-1; i >= 0; --i ) {
            var tb = this.dp_traceback[ i ][ error_level ];
            error_traceback[ i ] = tb[0];
            error_level = tb[1];
            position_error[i] = tb[0];
        }
        //for i in xrange( this.n_positions ) {
        //    print "Traceback position", i, "minimum error=", position_error[i]

        return error_traceback;
    };

    library.optimize_library_multiple_dcs = function() {
        this.error_span = this.max_per_position_error * this.n_positions;
        this.dp_divmin_for_error_mdcs = [];
        this.dp_last_mdc_primer_rep = [];
        this.dp_traceback_mdcs = [];
        for ( var i=0; i < this.n_positions; ++i ) {
            this.dp_divmin_for_error_mdcs[i] = [];
            this.dp_last_mdc_primer_rep[i] = [];
            this.dp_traceback_mdcs[i] = [];
            for ( var j=0; j <= this.max_extra_primers; ++j ) {
                this.dp_divmin_for_error_mdcs[i][j] = [];
                this.dp_last_mdc_primer_rep[i][j] = [];
                this.dp_traceback_mdcs[i][j] = [];
            }
        }
        // take care of position 0: copy this.divmin_for_error_for_n_dcs_sparse[0] into this.dp_divmin_for_error_mdcs
        for ( var i=0; i < Math.min( this.max_extra_primers+1, this.max_dcs_for_pos[0] ); ++i ) {
            for ( var j=0; j <= this.max_per_position_error; ++j ) {
                if ( this.divmin_for_error_for_n_dcs_sparse[0][i][j] !== this.infinity ) {
                    this.dp_divmin_for_error_mdcs[0][i][j] = this.divmin_for_error_for_n_dcs_sparse[0][i][j];
                    this.dp_last_mdc_primer_rep[0][i][j]   = this.primer_reps[0];
                    this.dp_traceback_mdcs[0][i][j]        = [ i, j, 0 ];
                }
            }
        }
        for ( var ii=1; ii <= this.n_positions; ++ii ) {
            // solve the dynamic programming problem for residues 0..ii
            var ii_primer_rep = this.primer_reps[ii];
            for ( var jj=0; jj <= this.max_extra_primers; ++jj ) {
                for ( var kk=0; kk <= this.error_span; ++kk ) {
                    // figure out, what's the minimum diversity where I get an error of kk using jj extra primers
                    // under the constraint that I don't use extra primers at position ii if extra degenerate codons
                    // were already used for another residue
                    var kk_best_libsize = this.infinity;
                    var kk_best_ii_error = this.infinity;
                    var kk_best_ii_nprimers = this.infinity;
                    var ll_limit = Math.min( this.max_dcs_for_pos[ii], jj+1 ); 
                    for ( var ll=0; ll < ll_limit; ++ll ) {
                        // ll: the number of degenerate codons - 1 from position ii
                        var ll_divmin = this.divmin_for_error_for_n_dcs_sparse[ii][ll];
                        var jj_dp_divmin = this.dp_divmin_for_error_mdcs[ii-1][jj-ll];
                        var jj_last_mdc_primer_rep = this.dp_last_mdc_primer_rep[ii-1][jj-ll];
                        for ( var mm = 0; mm <= this.max_per_position_error; ++mm ) {
                            // mm error being contributed by this position
                            // optimize this loop by precomputing the set of errors given ii, ll.
                            var iprev_error = kk-mm;
                            var mm_diversity = ll_divmin[mm];
                            if ( mm_diversity === this.infinity ) continue;
                            if ( ! jj_dp_divmin.hasOwnProperty( iprev_error ) ) continue;
                            if ( ll !== 0 && jj_last_mdc_primer_rep[ iprev_error ] === ii_primer_rep ) continue;

                            // ok, we are capable of generating kk error
                            var divsum = mm_diversity + jj_dp_divmin[ iprev_error ];
                            if ( kk_best_libsize === this.infinity || divsum < kk_best_libsize ) {
                                kk_best_libsize = divsum;
                                kk_best_ii_error = mm;
                                kk_best_ii_nprimers = ll;
                            }
                        } // end mm loop -- the error contribued by ii given ll degenerate codons are coming from ii
                    } // end ll loop -- the number of degenerate codons coming from ii

                    if ( kk_best_libsize !== this.infinity ) {
                        // we have a winner!
                        this.dp_divmin_for_error_mdcs[ii][jj][kk] = kk_best_libsize;
                        if ( kk_best_ii_nprimers !== 0 ) {
                            this.dp_last_mdc_primer_rep[ii][jj][kk] = ii_primer_rep;
                        }
                        this.dp_traceback_mdcs[ii][jj][kk] = [ kk_best_ii_nprimers, kk_best_ii_error, kk - kk_best_ii_error ];
                    }

                } // end kk loop -- the target amount of error
            } // end jj loop -- the number of extra primers used over the whole library
        } // end  ii loop -- position from 
    };

    library.traceback_mdcs = function( diversity_cap ) {
        var best = this.find_minimal_error_beneath_diversity_cap_mdcs( diversity_cap );
        return this.traceback_mdcs_from_nextra_and_error( best[0], best[1] );
    };

    library.find_minimal_error_beneath_diversity_cap_mdcs = function ( diversity_cap ) {
        var best_error = this.infinity;
        var best_nextra = this.infinity;
        for ( var ii=0; ii <= this.max_extra_primers; ++ii ) {
            var ii_dp_divmin = this.dp_divmin_for_error_mdcs[ this.n_positions-1 ][ ii ];
            for ( var jj=0; jj <= this.error_span; ++jj ) {
                if ( ! ii_dp_divmin.hasOwnProperty( jj ) ) continue;
                var jjdiversity = ii_dp_divmin[jj];
                if ( jjdiversity > diversity_cap ) continue;
                if ( best_error === this.infinity || jj < best_error ) {
                    best_error = jj;
                    best_nextra = ii;
                }
            }
        }
        console.log( "Smallest error of " + best_error + " requires " + best_nextra + " extra degenerate codons" );
        return [ best_nextra, best_error ];
    };

    library.traceback_mdcs_from_nextra_and_error = function( nextra, error_level ) {
        var error_traceback = [];
        for ( var i=0; i < this.n_positions; ++i ) { error_traceback[i] = [ this.infinity, this.infinity ]; }

        var position_error = [];
        for ( var i=0; i < this.n_positions; ++i ) { position_error[i] = 0; }
        for ( var i=this.n_positions-1; i >= 0; --i ) {
            var tb = this.dp_traceback_mdcs[ i ][ nextra ][ error_level ];
            error_traceback[i][ 0 ] = tb[ 0 ];
            error_traceback[i][ 1 ] = tb[ 1 ];
            nextra      = nextra - tb[ 0 ];
            error_level = error_level - tb[ 1 ];
            position_error[i] = tb[1];
        }
        for ( var i=0; i < this.n_positions; ++i ) {
            console.log( "Position " + i + " with error level " + error_traceback[i][1] + " contributing " + error_traceback[i][0] + " degenerate codons " );
        }
        return error_traceback;
    };

    return library;
}

function record_codon_data( position, codon_inds, library ) {
    // three things we need:
    // 1: the codon
    // 2: the amino acids that are represented
    // 2b: the counts from the original set of observations for each of the represented aas
    // 3: the amino acids and their counts in the original set of observations that are not represented

    var codon_data = {}

    var dc = DegenerateCodon();
    var aas_present  = newFilledArray( 21, false ); //library.aas_for_degenerate_codon( degenerate_codon );
    var orig_obs = library.aa_counts[ position ];
    var codon_diversity = 0;

    codon_data.orig_pos_string = library.orig_pos[ position ];

    var codons = [];
    for ( var ii=0; ii < codon_inds.length; ++ii ) {
        library.dclex.set_from_index( codon_inds[ii] );
        dc.set_from_lex( library.dclex );
        codon_diversity += dc.diversity();
        codons.push( dc.codon_string() );
        var iiaas = library.aas_for_dc[ codon_inds[ii] ];
        for ( var jj=0; jj < 21; ++jj ) {
            aas_present[jj] = aas_present[jj] || iiaas[jj];
        }
    }
    codons.sort();
    codon_data.codon_string = codons.join( ", " );

    codon_data.present_string = "";
    codon_data.error = 0;
    var aa_count = 0;
    for ( var i=0; i < aas_present.length; ++i ) {
        if ( aas_present[i] ) {
            ++aa_count;
            codon_data.present_string += " " + library.gcmapper.aastr_for_integer( i );
            if ( library.required[position][i] ) {
                codon_data.present_string += "(*)";
            } else {
                codon_data.present_string += "(" + orig_obs[i] + ")";
            }
            if ( orig_obs[i] < 0 ) {
                codon_data.error -= orig_obs[i];
            }
        }
    }

    codon_data.absent_string = "";
    for ( var i=0; i < aas_present.length; ++i ) {
        if ( orig_obs[i] > 0 && ! aas_present[i] ) {
            codon_data.absent_string += " " + library.gcmapper.aastr_for_integer( i ) + "(" + orig_obs[i] + ")";
            codon_data.error += orig_obs[i];
        }
    }

    codon_data.dna_diversity = codon_diversity;
    codon_data.log_dna_diversity = Math.log( codon_diversity );
    codon_data.aa_count = aa_count;
    codon_data.log_aa_diversity = Math.log( aa_count );

    return codon_data;
}    

function report_output_library_data( library, error_sequence ) {
    var dna_diversity_sum = 0;
    var aa_diversity_sum = 0;
    var output_library_data = {};
    output_library_data.positions = [];
    output_library_data.error = 0;
    for ( var ii=0; ii < library.n_positions; ++ii ) {
        var ii_n_extra_dcs = error_sequence[ ii ][ 0 ];
        var ii_error       = error_sequence[ ii ][ 1 ];
        var ii_dc_list = library.codons_for_error_for_n_dcs_sparse[ ii ][ ii_n_extra_dcs ][ ii_error ];
        var codon_data =  record_codon_data( ii, ii_dc_list, library );
        dna_diversity_sum += codon_data.log_dna_diversity;
        aa_diversity_sum +=  codon_data.log_aa_diversity;
        output_library_data.positions.push( codon_data );
        output_library_data.error += output_library_data.positions[ ii ].error;
    }
    output_library_data.dna_diversity = Math.exp( dna_diversity_sum );
    output_library_data.aa_diversity = Math.exp( aa_diversity_sum );
    return output_library_data;
}

var library = AALibrary();

function go() {

    //dc = DegenerateCodon();
    //dclex = LexicographicalIterator( [ 15, 15, 15 ] );
    //dclex.set_from_index( 15*15*3 + 15*4 + 12 );
    //dc.set_from_lex( dclex );
    //dc.log_diversity();
    //
    //return;

    //var dims = [7,7,7];
    //var lex = LexicographicalIterator( dims );
    //lex.upper_diagonal_reset();
    //while ( ! lex.at_end ) {
    //    console.log( "lex: " + lex.pos.join(", " ) );
    //    lex.upper_diagonal_increment();
    //}
    //return;

    var csv_contents = document.getElementById( "aaobs" ).value;
    library.load_library( csv_contents );

    library.enumerate_aas_for_all_degenerate_codons();
    var starttime = new Date().getTime();
    library.find_useful_codons();
    library.report_useful_codon_fraction();
    var stoptime = new Date().getTime();
    console.log( "finding useful codons took " + (( stoptime - starttime ) / 1000 )+ " seconds " );

    console.log( "enumerating sparse degenerate codon pairs" );
    var starttime = new Date().getTime();
    library.compute_smallest_diversity_for_all_errors_given_n_deg_codons_sparse();
    var stoptime = new Date().getTime();
    console.log( "enumerating sparse degenerate codon pairs took " + (( stoptime - starttime ) / 1000 )+ " seconds " );


    console.log( "running DP considering multiple degenerate codons" );
    var starttime = new Date().getTime();
    library.optimize_library_multiple_dcs();
    var stoptime = new Date().getTime();
    console.log( "running DP considering multiple degenerate codons took " + (( stoptime - starttime ) / 1000 )+ " seconds " );

    var error_traceback = library.traceback_mdcs( Math.log( 3.2e8 ) );

    var old = report_output_library_data( library, error_traceback );
    for ( var ii = 0; ii < library.n_positions; ++ii ) {
        var iipos = old.positions[ ii ];
        console.log( "Pos: " + iipos.orig_pos_string + " codons: " + iipos.codon_string + " AAs: " + iipos.present_string + " Absent: " + iipos.absent_string );
    }


    //console.log( "enumerating degenerate codon pairs" );
    //library.compute_smallest_diversity_for_all_errors();
    //var starttime = new Date().getTime();
    //library.compute_smallest_diversity_for_all_errors_given_n_degenerate_codons();
    //var stoptime = new Date().getTime();
    //console.log( "enumerating degenerate codon pairs took " + (( stoptime - starttime ) / 1000 )+ " seconds " );
    //
    //var nbad = 0;
    //for ( var i = 0; i < library.n_positions; ++i ) {
    //    for ( var j = 0; j < library.max_per_position_error; ++j ) {
    //        if ( Math.abs( library.divmin_for_error_for_n_dcs[i][0][j] - library.divmin_for_error[i][j] ) > 1e-6 ) {
    //            nbad += 1;
    //            if ( nbad < 10 ) {
    //                console.log( "Bad #" + nbad + ", pos " + i + " error " + j + " " + library.divmin_for_error_for_n_dcs[i][0][j] + " != " + library.divmin_for_error[i][j] );
    //            }
    //        }
    //    }
    //}
    //console.log( "Nbad comparing library.divmin_for_error_for_n_dcs[i][0] against library.divmin_for_error[i]: " + nbad );
    //
    //var nbad = 0;
    //for ( var i = 0; i < library.n_positions; ++i ) {
    //    for ( var j = 0; j < library.max_dcs_per_pos; ++j ) {
    //        for ( var k = 0; k < library.max_per_position_error; ++k ) {
    //            if ( Math.abs( library.divmin_for_error_for_n_dcs[i][j][k] - library.divmin_for_error_for_n_dcs_sparse[i][j][k] ) > 1e-6 ) {
    //                nbad += 1;
    //                if ( nbad < 10 ) {
    //                    console.log( "Bad #" + nbad + ", pos " + i + " ncodons " + j + " error " + k + " " + library.divmin_for_error_for_n_dcs[i][j][k] + " != " + library.divmin_for_error_for_n_dcs_sparse[i][j][k] );
    //                    var codons = [];
    //                    var dc = DegenerateCodon();
    //                    var lex = LexicographicalIterator( [ 15, 15, 15 ] );
    //                    for ( var l = 0; l < library.codons_for_error_for_n_dcs[i][j][k].length; ++l ) {
    //                        var lexind = library.codons_for_error_for_n_dcs[i][j][k][l];
    //                        lex.set_from_index( lexind );
    //                        dc.set_from_lex( lex );
    //                        codons.push( dc.codon_string() );
    //                    }
    //                    console.log( "Codons: " + codons.join(", ") );
    //                }
    //            }
    //        }
    //    }
    //}
    //console.log( "Nbad comparing library.divmin_for_error_for_n_dcs against library.divmin_for_error_for_n_dcs_sparse: " + nbad );

    //var diversity_cap = 320000000;
    //var best = library.optimize_library( diversity_cap );
    //print_output_codons( library, best, diversity_cap );
}

// Local Variables:
// js-indent-level: 4
// indent-tabs-mode: nil
// End: