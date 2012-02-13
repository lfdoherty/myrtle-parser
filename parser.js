
function removeLineComments(line){
	var pos = line.indexOf('//');
	if(pos !== -1) return line.substring(0, pos);
	else return line;
}

function removeMultilineComments(lines){
	
	var inComment = false;
	for(var j=0;j<lines.length;++j){
		var line = lines[j];
		if(inComment){
			var ei = line.indexOf('*/');
			if(ei !== -1){
				inComment = false;
				lines[j] = line.substr(ei+2);
			}else{
				lines.splice(j, 1);
			}
			--j;
		}else{
			var i = line.indexOf('/*');
			if(i !== -1){
				var ei = line.indexOf('*/', i);
				if(ei !== -1){
					lines[j] = line.substr(0, i) + line.substr(ei+2);
					--j;
				}else{
					lines[j] = line.substr(0, i);
					inComment = true;
				}
			}
		}
	}
}

function countIndents(line){
	var k=0;
	while(k < line.length && line.charAt(k) === '\t'){
		++k;
	}
	return k;
}

function splitOnSpaces(str){
	var r = [];
	var cur = '';
	var rb = 0;
	var sb = 0;
	var cb = 0;
	for(var i=0;i<str.length;++i){
		var c = str.charAt(i);
		if(c === '[') ++sb;
		else if(c === ']') --sb;
		else if(c === '(') ++sb;
		else if(c === ')') --sb;
		else if(c === '{') ++sb;
		else if(c === '}') --sb;

		if(c === ' ' && rb === 0 && sb === 0 && cb === 0){
			if(cur.length > 0){
				r.push(cur);
				cur = '';
			}
		}else{
			cur += c;			
		}
	}
	if(cur.length > 0) r.push(cur);
	//console.log('[' + str + ']');
	//console.log(r);
	return r;
}

function parseTokens(line){
	var tempTokens = splitOnSpaces(line);//line.split(' ');
	//console.log(tempTokens);
	var tokens = [];
	for(var k=0;k<tempTokens.length;++k){
		var token = tempTokens[k];
		token = token.trim();
		if(token.length > 0) tokens.push(token);
	}
	return tokens;
}

//var sys = require('sys');

exports.parse = function(str){

	if(typeof(str) !== 'string'){
		throw 'parse str is not of type string';
	}

	var lines = str.split('\n');
	
	//console.log(lines);
	removeMultilineComments(lines);
	///sys.debug(lines);

	var stack = [{tokens: [], children: []}];
	var depth = 0;
	for(var i=0;i<lines.length;++i){
	
		var line = removeLineComments(lines[i]);
		
		if(line.trim().length === 0) continue;
		
		var indent = countIndents(line);
		line = line.substr(indent);
		if(indent < depth){
			var many = depth - indent;
			for(var j=0;j<many;++j){stack.pop();}
		}else if(indent > depth){
			console.log('invalid indentation on line ' + (i+1));
			console.log('line: ' + lines[i]);
			throw 'parse error';
		}
			
		var node = {tokens: parseTokens(line), children: []};
		stack[stack.length-1].children.push(node);
		stack.push(node);
		depth = indent + 1;
	}
	
	return stack[0];
}

exports.printAst = function(ast, tabs){
	var str = '';
	str += (tabs || '') + ast.tokens.join(' ') + '\n';
	for(var i=0;i<ast.children.length;++i){
		str += exports.printAst(ast.children[i], tabs !== undefined ? tabs + '\t' : '');
	}
	return str;
}

