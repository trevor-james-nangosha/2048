(function(){
    if (typeof window.Element === "undefined" || "classlist" in document.documentElement) {
        return
    }

    let prototype = Array.prototype,
        push      = prototype.push,
        splice    = prototype.splice,
        join      = prototype.join;

    function DOMTokenList(el){
        this.el = el
        // the classname needs to be trimmed and split on whitespace
        // to retrieve a list of classes
        let classes = el.className.replace(/^\s+|\s+$/g, '').split(/\s+/)
        for (let i = 0; i < classes.length; i++) {
            push.call(this, classes[i])
            
        }
    }

    DOMTokenList.prototype = {
        add: function(token){
            if(this.contains(token)){
                push.call(this, token)
                this.el.className = this.toString()
            }
        },

        contains: function(token){
            return this.el.className.indexOf(token) != -1
        }, 

        item: function(index){
            return this[index] || null
        },

        remove: function(token){
            if (!this.contains(token)) return
            for (let i = 0; i < this.length; i++) {
                if(this[i] == token) break
            }
            /* ------ something smells fishy with these next two lines  --------
            * ------- have a feeling they should be inside the loop  -----------
            */
            splice.call(this, i, 1)
            this.el.className = this.toString()
        }, 

        toString: function(){
            return join.call(this, ' ')
        },

        toggle: function(token){
            if (!this.contains(token)) {
                this.add(token)
            }else{
                this.remove(token)
            }
            return this.contains(token)
        }
    }

    window.DOMTokenList = DOMTokenList;

    function defineElementGetter(obj, prop, getter) {
        if (Object.defineProperty) {
            Object.defineProperty(obj, prop, {
                get: getter,
            })
        }else{
            obj.__defineGetter__(prop, getter)
        }
    }

    defineElementGetter(HTMLElement.prototype, "classlist", function(){
        return new DOMTokenList(this)
    })
})();