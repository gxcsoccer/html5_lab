function HTMLLexicalParser(changed) {

    function emitToken(token) {
        console.log(token);
    }

    function error() {
        console.log("error");
    }


    function StartTagToken() {}

    function EndTagToken() {}

    function Attribute() {}

    var token;
    var attribute;

    //function consumeReference();
    //状态函数们……
    var dataState = function dataState(c) {
            if (c == "<") {
                return tagOpenState;
            } else {
                emitToken(c);
                return dataState;
            }
        };
    var tagOpenState = function tagOpenState(c) {
            if (c == "/") {
                return endTagOpenState;
            }
            if (c.match(/[A-Z]/)) {
                token = new StartTagToken();
                token.name = c.toLowerCase();
                return tagNameState;
            }
            if (c.match(/[a-z]/)) {
                token = new StartTagToken();
                token.name = c;
                return tagNameState;
            }
            if (c == "?") {
                return bogusCommentState;
            } else {
                error();
                return dataState;
            }
        };
    var endTagOpenState = function endTagOpenState(c) {
            if (c.match(/[A-Z]/)) {
                token = new EndTagToken();
                token.name = c.toLowerCase();
                return tagNameState;
            }
            if (c.match(/[a-z]/)) {
                token = new EndTagToken();
                token.name = c;
                return tagNameState;
            }
            if (c == ">") {
                error();
                return dataState;
            } else {
                error();
                return bogusCommentState;
            }
        };
    var tagNameState = function tagNameState(c) {
            if (c.match(/[\t \f\n]/)) {
                return beforeAttributeNameState;
            }
            if (c == "/") {
                return selfClosingStartTagState;
            }
            if (c == ">") {
                emitToken(token);
                return dataState;
            }
            if (c.match(/[a-z]/)) {
                token.name += c.toLowerCase();
                return tagNameState;
            }
        }
    var beforeAttributeNameState = function beforeAttributeNameState(c) {
            if (c.match(/[\t \f\n]/)) {
                return beforeAttributeNameState;
            }
            if (c == "/") {
                return selfClosingStartTagState;
            }


            if (c == ">") {
                emitToken(token);
                return dataState;
            }
            if (c.match(/[a-z]/)) {
                attribute = new Attribute();
                attribute.name = c.toLowerCase();
                attribute.value = "";
                return attributeNameState;
            }
            if (c == "\"" || c == "'" || c == "<" || c == "\"") {
                error();
            } else {
                attribute = new Attribute();
                attribute.name = c;
                attribute.value = "";
                return attributeNameState;
            }
        }
    var attributeNameState = function attributeNameState(c) {
            if (c == "/") {
                token[attribute.name] = attribute.value;
                return selfClosingStartTagState;
            }
            if (c == "=") {
                return beforeAttributeValueState;
            }
            if (c.match(/[\t \f\n]/)) {
                return afterAttributeNameState;
            }
            if (c.match(/[A-Z]/)) {
                attribute.name += c.toLowerCase();
                return attributeNameState;
            } else {
                attribute.name += c;
                return attributeNameState;
            }
        }

    var afterAttributeNameState = function afterAttributeNameState(c) {
            if (c == "/") {
                token[attribute.name] = attribute.value;
                return selfClosingStartTagState;
            }
            if (c == "/") {
                token[attribute.name] = attribute.value;
                return selfClosingStartTagState;
            }
            if (c == "=") {
                return beforeAttributeValueState;
            }
            if (c.match(/[\t \f\n]/)) {
                return afterAttributeNameState;
            }
            if (c.match(/[A-Z]/)) {
                attribute = new Attribute();
                attribute.name = c.toLowerCase();
                attribute.value = "";

                return attributeNameState;
            } else {
                attribute = new Attribute();
                attribute.name = c;
                attribute.value = "";
                return attributeNameState;
            }
        }

    var beforeAttributeValueState = function beforeAttributeValueState(c) {

            if (c == "\"") {
                return attributeValueDoubleQuoted;
            }
            if (c == "\'") {
                return attributeValueSingleQuoted;
            }

            if (c.match(/[\t \f\n]/)) {
                return beforeAttributeValueState;
            } else {
                attribute.value += c;
                return attributeValueUnquoted;
            }
        }
    var attributeValueDoubleQuoted = function attributeValueDoubleQuoted(c) {
            if (c == "\"") {
                token[attribute.name] = attribute.value;
                return beforeAttributeNameState;
            } else {
                attribute.value += c;
                return attributeValueDoubleQuoted;
            }
        }

    var attributeValueSingleQuoted = function attributeValueSingleQuoted(c) {
            if (c == "\'") {
                token[attribute.name] = attribute.value;
                return beforeAttributeNameState;
            } else {
                attribute.value += c;
                return attributeValueSingleQuoted;
            }
        }

    var attributeValueUnquoted = function attributeValueUnquoted(c) {
            if (c.match(/[\t \f\n]/)) {
                token[attribute.name] = attribute.value;
                return beforeAttributeNameState;
            } else {
                attribute.value += c;
                return attributeValueUnquoted;
            }
        }
    var selfClosingStartTagState = function selfClosingStartTagState(c) {
            if (c == ">") {
                emitToken(token);
                return dataState;
            }
        }
    var bogusCommentState = function bogusCommentState(c) {
            if (c == ">") {
                return dataState;
            } else {
                return bogusCommentState;
            }
        }


    var state = dataState;
    this.receiveInput = function(char) {
        changed && changed(state.name);
        state = state(char);
    }

}