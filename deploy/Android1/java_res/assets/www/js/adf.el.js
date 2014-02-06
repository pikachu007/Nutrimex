// @compiled on Thu Sep 19 17:22:08 EDT 2013
// Note: this is a generated file all changes will be lost. 


/////////////////////////////////////// start of /Users/buildprocess/HudsonHome/jobs/adfmf-v11-11.1.2.4.1-tip/workspace/Container/JavaScript/ADF/js/ELErrors.js///////////////////////////////////////



var adf                    = window.adf                 || {};
adf.mf                     = adf.mf                     || {};
adf.mf.api                 = adf.mf.api                 || {};
adf.mf.el                  = adf.mf.el                  || {};
adf.mf.locale              = adf.mf.locale              || {};
adf.mf.log                 = adf.mf.log                 || {};
adf.mf.resource            = adf.mf.resource            || {};
adf.mf.util                = adf.mf.util                || {};

adf.mf.internal            = adf.mf.internal            || {};
adf.mf.internal.api        = adf.mf.internal.api        || {};
adf.mf.internal.el         = adf.mf.internal.el         || {};
adf.mf.internal.el.parser  = adf.mf.internal.el.parser  || {};
adf.mf.internal.locale     = adf.mf.internal.locale     || {};
adf.mf.internal.log        = adf.mf.internal.log        || {};
adf.mf.internal.mb         = adf.mf.internal.mb         || {};
adf.mf.internal.perf       = adf.mf.internal.perf       || {};
adf.mf.internal.perf.story = adf.mf.internal.perf.story || {};
adf.mf.internal.resource   = adf.mf.internal.resource   || {};
adf.mf.internal.util       = adf.mf.internal.util       || {};


/*
 * Represents any of the ADF flavored exceptions
 */
adf.mf.AdfException = function(message) { 
	/* since this is the only exception that is know and sent to both sides of the channel it needs to match the Java type */ 
	this[adf.mf.internal.api.constants.TYPE_PROPERTY]           = "oracle.adfmf.framework.exception.AdfException";
	this[adf.mf.internal.api.constants.EXCEPTION_FLAG_PROPERTY] = true;
	this.name                                                   = 'AdfException';
	this.message                                                = (message || "");
};
adf.mf.AdfException.prototype = new Error();


/*
 * Represents any of the exception conditions that can arise during expression evaluation.
 */
adf.mf.ELException = function(message) { 
	this[adf.mf.internal.api.constants.TYPE_PROPERTY]           = "oracle.adfmf.framework.exception.ELException";
	this[adf.mf.internal.api.constants.EXCEPTION_FLAG_PROPERTY] = true;
	this.name                                                   = 'ELException';
	this.message                                                = (message || "");
};
adf.mf.ELException.prototype = new Error();


/**
 * Thrown to indicate that a method has been passed an illegal or 
 * inappropriate argument.
 */
adf.mf.IllegalArgumentException = function(message) { 
	this[adf.mf.internal.api.constants.TYPE_PROPERTY]           = "oracle.adfmf.framework.exception.IllegalArgumentException";
	this[adf.mf.internal.api.constants.EXCEPTION_FLAG_PROPERTY] = true;
	this.name                                                   = 'IllegalArgumentException';
	this.message                                                = (message || "");
};
adf.mf.IllegalArgumentException.prototype = new Error();

/**
 * Thrown to indicate that an array is being accessed beyond
 * it array boundaries.
 */
adf.mf.IndexOutOfBoundsException = function(message) { 
	this[adf.mf.internal.api.constants.TYPE_PROPERTY]           = "oracle.adfmf.framework.exception.IndexOutOfBoundsException";
	this[adf.mf.internal.api.constants.EXCEPTION_FLAG_PROPERTY] = true;
	this.name                                                   = 'IndexOutOfBoundsException';
	this.message                                                = (message || "");
};
adf.mf.IndexOutOfBoundsException.prototype = new Error();

/**
 * Thrown to indicate that the channel is not available.
 */
adf.mf.NoChannelAvailableException = function(message) { 
	this[adf.mf.internal.api.constants.TYPE_PROPERTY]           = "oracle.adfmf.framework.exception.NoChannelAvailableException";
	this[adf.mf.internal.api.constants.EXCEPTION_FLAG_PROPERTY] = true;
	this.name                                                   = 'NoChannelAvailableException';
	this.message                                                = (message || "Operation not supported in the current environment");
};     
adf.mf.NoChannelAvailableException.prototype = new Error();


/**
 * Thrown to indicate that a null pointer has been encountered.
 */
adf.mf.NullPointerException = function(message) { 
	this[adf.mf.internal.api.constants.TYPE_PROPERTY]           = "oracle.adfmf.framework.exception.NullPointerException";
	this[adf.mf.internal.api.constants.EXCEPTION_FLAG_PROPERTY] = true;
	this.name                                                   = 'NullPointerException';
	this.message                                                = (message || "");
};
adf.mf.NullPointerException.prototype = new Error();


/**
 * Thrown to indicate that a illegal state has been encountered.
 */
adf.mf.IllegalStateException = function(message) { 
	this[adf.mf.internal.api.constants.TYPE_PROPERTY]           = "oracle.adfmf.framework.exception.IllegalStateException";
	this[adf.mf.internal.api.constants.EXCEPTION_FLAG_PROPERTY] = true;
	this.name                                                   = 'IllegalStateException';
	this.message                                                = (message || "");
};
adf.mf.IllegalStateException.prototype = new Error();


/**
 * Thrown when a property could not be found while evaluating a {@link adf.mf.el.ValueExpression} or
 * {@link MethodExpression}. For example, this could be triggered by an index out of bounds while
 * setting an array value, or by an unreadable property while getting the value of a JavaBeans
 * property.
 */
adf.mf.PropertyNotFoundException = function(message) { 
	this[adf.mf.internal.api.constants.TYPE_PROPERTY]           = "oracle.adfmf.framework.exception.PropertyNotFoundException";
	this[adf.mf.internal.api.constants.EXCEPTION_FLAG_PROPERTY] = true;
	this.name                                                   = 'PropertyNotFoundException';
	this.message                                                = (message || "");
};
adf.mf.PropertyNotFoundException.prototype = new Error();


/**
 * Thrown when a property could not be written to while setting the value on a
 * {@link adf.mf.el.ValueExpression}. For example, this could be triggered by trying to set a map value on an
 * unmodifiable map.
 */
adf.mf.PropertyNotWritableException = function(message) { 
	this[adf.mf.internal.api.constants.TYPE_PROPERTY]           = "oracle.adfmf.framework.exception.PropertyNotWritableException";
	this[adf.mf.internal.api.constants.EXCEPTION_FLAG_PROPERTY] = true;
	this.name                                                   = 'PropertyNotWritableException';
	this.message                                                = (message || "");
};
adf.mf.PropertyNotWritableException.prototype = new Error();


/**
 * Thrown to indicate that the requested operation is not supported.
 */
adf.mf.UnsupportedOperationException = function(message) { 
	this[adf.mf.internal.api.constants.TYPE_PROPERTY]           = "oracle.adfmf.framework.exception.UnsupportedOperationException";
	this[adf.mf.internal.api.constants.EXCEPTION_FLAG_PROPERTY] = true;
	this.name                                                   = 'UnsupportedOperationException';
	this.message                                                = (message || "");
};
adf.mf.UnsupportedOperationException.prototype = new Error();


adf.mf.DataRangeNotPresentException = function(message) {
	this[adf.mf.internal.api.constants.TYPE_PROPERTY]           = "oracle.adfmf.framework.exception.DataRangeNotPresentException";
	this[adf.mf.internal.api.constants.EXCEPTION_FLAG_PROPERTY] = true;
	this.name                                                   = 'DataRangeNotPresentException';
	this.message                                                = (message || "");
};
adf.mf.DataRangeNotPresentException.prototype = new Error();



/////////////////////////////////////// end of /Users/buildprocess/HudsonHome/jobs/adfmf-v11-11.1.2.4.1-tip/workspace/Container/JavaScript/ADF/js/ELErrors.js///////////////////////////////////////



/////////////////////////////////////// start of /Users/buildprocess/HudsonHome/jobs/adfmf-v11-11.1.2.4.1-tip/workspace/Container/JavaScript/ADF/js/JavaScriptContext.js///////////////////////////////////////

//@requires ELErrors
//@requires ArrayELResolver
//@requires MapELResolver
//@requires CompositeELResolver
//@requires JavaScriptExpressionFactory
//@requires ValueExpression
//@requires ValueReference
//@requires AdfPerfTiming

//@requires RootPropertyELResolver


var adf                    = window.adf                 || {};
adf.mf                     = adf.mf                     || {};
adf.mf.api                 = adf.mf.api                 || {};
adf.mf.el                  = adf.mf.el                  || {};
adf.mf.locale              = adf.mf.locale              || {};
adf.mf.log                 = adf.mf.log                 || {};
adf.mf.resource            = adf.mf.resource            || {};
adf.mf.util                = adf.mf.util                || {};

adf.mf.internal            = adf.mf.internal            || {};
adf.mf.internal.api        = adf.mf.internal.api        || {};
adf.mf.internal.el         = adf.mf.internal.el         || {};
adf.mf.internal.el.parser  = adf.mf.internal.el.parser  || {};
adf.mf.internal.locale     = adf.mf.internal.locale     || {};
adf.mf.internal.log        = adf.mf.internal.log        || {};
adf.mf.internal.mb         = adf.mf.internal.mb         || {};
adf.mf.internal.perf       = adf.mf.internal.perf       || {};
adf.mf.internal.perf.story = adf.mf.internal.perf.story || {};
adf.mf.internal.resource   = adf.mf.internal.resource   || {};
adf.mf.internal.util       = adf.mf.internal.util       || {};


/**
 * JavaScriptContext is defined here.  It is an internal object but depends on 
 * a couple helper objects (JavaScriptFunctions and JavaScriptVariables) that
 * are defined here as well.  Since only the JavaScriptContext must be exposed
 * to other internal objects, it will have an adf.mf.internal.el namespace.  The
 * others are never exposed and are only local to this initialization function.
 */
(function() {
   /* private to the JavaScriptContext object */
   function JavaScriptFunctions() { /* implements FunctionMapper */
      /* map from function name to function implementation */
      this.map    = null;

      /* function */
      this.resolveFunction = function(/* String */ prefix, /* String */ localName) {
         if (this.map === null) {
            this.map = {};
         }
         return this.map[prefix + ":" + localName];
      };

      /* void */
      this.setFunction = function(/* String */ prefix, /* String */ localName, /* Function */ func) {
         if (this.map === null) {
            this.map = {};
         }
         this.map[prefix + ":" + localName] = func;
      };
   };

   /* private to the JavaScriptContext object */
   function JavaScriptVariables()  { /* implements VariableMapper */
      /* map from variable name to variable's value */
      this.map             = null;
      this.nextModLZWCode  = 0;

      /* adf.mf.el.ValueExpression */
      this.resolveVariable = function(/* String */ variable) {
         if (this.map === null) {
            this.map = {};
         }
         // adf.mf.internal.perf.trace("JavaScriptVariables.resolveVariable", variable);	
         return this.map[variable];
      };

      /* adf.mf.el.ValueExpression */
      this.setVariable = function(/* String */ variable, /* value */ value) {
         if (this.map === null) {
            this.map = {};
         }

         this.map[variable] = value;
         // adf.mf.internal.perf.trace("JavaScriptVariables.setVariable", variable);	

         return this.map[variable];
      };

      /* void */
      this.removeVariable = function(/* String */ variable) {
         if(this.map !== null) {
            if(this.map[variable] !== undefined) {
               delete this.map[variable];
            }
         }
      };

      /* void */
      this.clearWeakReferences = function() {
         if(this.map !== null) {
            for(var v in this.map) {
               if(this.map[v][adf.mf.internal.api.constants.WEAK_REFERENCE_PROPERTY] !== undefined) {
                  adf.mf.internal.perf.trace("JavaScriptVariables.clearWeakReferences", "removing weak ref - " + v);	
                  delete this.map[v];
               }
            }
            this.nextModLZWCode = 0;
         }
      };		

      /* String */
      this.resolveWeakReference = function(/* String */ variable) {
         var v = this.resolveVariable(variable);

         if(v != undefined) {
            return v[adf.mf.internal.api.constants.WEAK_REFERENCE_PROPERTY];
         }
         return undefined;
      };

      /* String */
      this.getWeakReference = function(/* string */ name) {
         if(this.map !== null) {
            for(var v in this.map) {
               var fqn = this.map[v][adf.mf.internal.api.constants.WEAK_REFERENCE_PROPERTY];

               if((fqn !== undefined) && (name.indexOf(fqn) == 0))
               {
                  var wrn = v + name.substring(fqn.length);

                  adf.mf.internal.perf.trace("JavaScriptVariables.getWeakReference", "just found weak ref - " + wrn);	
                  return wrn;
               }
            }
         }
         return undefined;
      };		

      /* String */
      this.findMatchingWeakReference = function(/* string */ name) {
         if(this.map !== null) {
            for(var v in this.map) {
               var fqn = this.map[v][adf.mf.internal.api.constants.WEAK_REFERENCE_PROPERTY];

               if((fqn !== undefined) && (name == fqn))
               {
                  return v;
               }
            }
         }
         return undefined;
      };		

      /* String */
      this.addCompressedReference = function(/* string */ reference)
      {
         var lzwk = this.findMatchingWeakReference(reference);

         if(lzwk == undefined) {
            var key  = adf.mf.internal.api.constants.WEAK_REFERENCE_PROPERTY;
            var wr   = {};

            wr[key] = reference;
            lzwk    = "_" + (this.nextModLZWCode++);

            adf.mf.internal.perf.trace("JavaScriptVariables.addCompressedReference", "just added a weak ref - " + wr);	
            this.setVariable(lzwk, wr);
         }

         return lzwk;
      };
   };

   /* Still internal but exposed to the other internal objects */
   adf.mf.internal.el.JavaScriptContext = function(/* ELResolver */ elResolver) { /* implements ELContext */
      this.context           = this;
      this.functions         = null;
      this.resolver          = (elResolver || null);
      this.variables         = null;
      this.vmchannel         = null;
      this.security          = null;
      this.modid             = (new Date()).getMilliseconds;

      /**
       * Get the modification id for the context.
       */
      /* int */
      this.getModId = function() {
         return this.modid;
      };

      /**
       * Update the modification id for the context.
       */
      /* void */
      this.updateModId = function() {
         this.modid         = (new Date()).getMilliseconds;
      };



      /**
       * Returns the context object associated with the given key. The ELContext maintains a
       * collection of context objects relevant to the evaluation of an expression. These context
       * objects are used by ELResolvers. This method is used to retrieve the context with the given
       * key from the collection. By convention, the object returned will be of the type specified by
       * the key. However, this is not required and the key is used strictly as a unique identifier.
       * 
       * @param key
       *            The unique identifier that was used to associate the context object with this
       *            ELContext.
       * @return The context object associated with the given key, or null if no such context was
       *         found.
       * @throws NullPointerException
       *             if key is null.
       */
      /* ELContext */
      this.getContext = function(/* Class */ key) {
         /* first check to make sure we have a context to give back */
         if((this.context === undefined) || (this.context === null)) {
            return null;
         }

         /* next check that they passed a key and if not return the root context */
         if(key === undefined)  {
            return this.context;
         }

         /* looks like we have everything so return the key'ed context */
         return this.context[key];
      };


      /**
       * Retrieves the ELResolver associated with this context. The ELContext maintains a reference to
       * the ELResolver that will be consulted to resolve variables and properties during an
       * expression evaluation. This method retrieves the reference to the resolver. Once an ELContext
       * is constructed, the reference to the ELResolver associated with the context cannot be
       * changed.
       * 
       * @return The resolver to be consulted for variable and property resolution during expression
       *         evaluation.
       */
      /* ELResolver */
      this.getELResolver = function() {
         if (this.resolver === null) {
            this.resolver = new adf.mf.internal.el.CompositeELResolver();

            /* add some scopes to the context */
            this.getVariableMapper().setVariable("viewScope",        {});
            this.getVariableMapper().setVariable("pageFlowScope",    {});
            this.getVariableMapper().setVariable("applicationScope", {});
            this.getVariableMapper().setVariable("preferenceScope",  {});
            this.getVariableMapper().setVariable("validationScope",  {});
            this.getVariableMapper().setVariable("deviceScope", {"device": {}, "hardware": {"screen": {}}});

            /* add the basic type resolvers to the JavaScript context */
            this.resolver.add(new adf.mf.internal.el.AttributeELResolver(false));           /* attribute resolver             */
            this.resolver.add(new adf.mf.internal.el.AttributeBindingELResolver(false));    /* attribute bindings resolver    */
            this.resolver.add(new adf.mf.internal.el.TreeBindingsELResolver(false));        /* tree bindings resolver         */
            this.resolver.add(new adf.mf.internal.el.TreeNodeELResolver(false));            /* tree node resolver             */
            this.resolver.add(new adf.mf.internal.el.ArrayELResolver(false));               /* standard array resolver        */
            this.resolver.add(new adf.mf.internal.el.MapELResolver(false));                 /* standard property map resolver */
            this.resolver.add(new adf.mf.internal.el.RootPropertyELResolver(false));        /* root variables resolver        */
         }
         return this.resolver;
      };


      /**
       * Retrieves the FunctionMapper associated with this ELContext.
       * 
       * @return The function mapper to be consulted for the resolution of EL functions.
       */
      /* FunctionMapper */
      this.getFunctionMapper = function() {
         if (this.functions === null) {
            this.functions = new JavaScriptFunctions();
         }
         return this.functions;
      };


      /**
       * Retrieves the VariableMapper associated with this ELContext.
       * 
       * @return The variable mapper to be consulted for the resolution of EL variables.
       */
      /* VariableMapper */
      this.getVariableMapper = function() {
         if (this.variables === null) {
            this.variables = new JavaScriptVariables();
         }
         // adf.mf.internal.perf.trace("JavaScriptContext.getVariableMapper", this.variables);	
         return this.variables;
      };


      /**
       * Returns whether an {@link ELResolver} has successfully resolved a given (base, property)
       * pair. The {@link CompositeELResolver} checks this property to determine whether it should
       * consider or skip other component resolvers.
       * 
       * @return The variable mapper to be consulted for the resolution of EL variables.
       * @see CompositeELResolver
       */
      /* boolean */ 
      this.isPropertyResolved = function() {
         return this.resolved;
      };


      /**
       * Associates a context object with this ELContext. The ELContext maintains a collection of
       * context objects relevant to the evaluation of an expression. These context objects are used
       * by ELResolvers. This method is used to add a context object to that collection. By
       * convention, the contextObject will be of the type specified by the key. However, this is not
       * required and the key is used strictly as a unique identifier.
       * 
       * @param key
       *            The key used by an {@link ELResolver} to identify this context object.
       * @param contextObject
       *            The context object to add to the collection.
       * @throws NullPointerException
       *             if key is null or contextObject is null.
       */
      /* void */ 
      this.putContext = function(/* Class */ key, /* object */ contextObject) {
         if((this.context === undefined) || (this.context === null)){
            this.context = {};
         }
         if((key === undefined) || (key === null)) {
            throw Error("invalid key");
         }

         if((contextObject === undefined) || (contextObject === null)) {
            throw Error("invalid context object");
         }

         this.context[key] = contextObject;
      };


      /* void */
      this.setELResolver = function(/* ELResolver */ resolver) {
         this.resolver = resolver;
      };


      /* void */
      this.setFunction = function(/* String */ prefix, /* String */ localName, /* Function */ func) {
         if (this.functions === null) {
            this.functions = new JavaScriptFunctions();
         }
         this.functions.setFunction(prefix, localName, func);
      };


      /**
       * Called to indicate that a ELResolver has successfully resolved a given (base, property) pair.
       * The {@link CompositeELResolver} checks this property to determine whether it should consider
       * or skip other component resolvers.
       * 
       * @param resolved
       *            true if the property has been resolved, or false if not.
       * @see CompositeELResolver
       */
      /* void */ 
      this.setPropertyResolved = function(/* boolean */ resolved) {
         this.resolved = resolved;
      };



      /* void */
      this.clearWeakReferences = function() {
         if (this.variables === null) {
            this.variables = new JavaScriptVariables();
         }
         // adf.mf.internal.perf.trace("JavaScriptContext.setVariable", name);	
         return this.variables.clearWeakReferences();
      };

      /* String */
      this.getWeakReference = function(/* String */ name) {
         if (this.variables === null) {
            this.variables = new JavaScriptVariables();
         }

         return this.variables.getWeakReference(name);
      };


      /* String */
      this.addCompressedReference = function(/* String */ name) {
         if (this.variables === null) {
            this.variables = new JavaScriptVariables();
         }

         return this.variables.addCompressedReference(name);
      };

      this.uncompressReference = function(/* String */ name) {
         try
         {
            var index  = name.indexOf(".");
            var term0  = (index > 0)? name.substring(0, index) : name;
            var suffix = (index > 0)? name.substring(index)    : "";
            var result = undefined;

            if(this.variables != null) {
               result = this.variables.resolveWeakReference(term0);
            }
            return (result != undefined)? result + suffix : name;
         }
         catch(err)
         {
            return name;
         }
      };		

      /* void */
      this.setVariable = function(/* String */ name, /* adf.mf.el.ValueExpression */ expression) {
         if (this.variables === null) {
            this.variables = new JavaScriptVariables();
         }
         // adf.mf.internal.perf.trace("JavaScriptContext.setVariable", name);	
         return this.variables.setVariable(name, expression);
      };


      /* void */
      this.removeVariable = function(/* String */ name) {
         if (this.variables === null) {
            this.variables = new JavaScriptVariables();
         }
         // adf.mf.internal.perf.trace("JavaScriptContext.removeVariable", name);	
         return this.variables.removeVariable(name);
      };


      /* void */
      this.invokeJavaMethod = function(/* Communication channel Id */ commId, request, success, failed) {
         if(this.vmchannel === null) {
            this.vmchannel  = new adf.mf.internal.VMChannel(this);
         }

         if (commId != undefined)
         {
            request.featureId = commId;
         }
         // adf.mf.internal.perf.trace("JavaScriptContext.invokeJavaMethod", (request.classname + ":" + request.method));	
         this.vmchannel.nonBlockingCall(request, success, failed);
      };

      /* void */
      this.invokeSecurityMethod = function(command, username, password, tenantname, success, failed) {
         if(this.security === null) {
            //this.security  = new Security(this);
            this.security  = new adf.mf.security(this);
         }
         var fm = this.getFunctionMapper();
         var f  = fm.resolveFunction("Security", command);
         return f.call(undefined, username, password, tenantname, success, failed);
      };

      /* String */ 
      this.toString = function() {
         return "[ ELContext: " + this.context + " ]";
      };
   };


   adf.mf.internal.VMChannel = function(/* Context */ context) {
      /**
       * blockingCall(java-class-name, java-class-method-name, success-callback, failed-callback, arguments);
       */
      this.blockingCall = function(request, success, failed) {
         throw adf.mf.UnsupportedOperationException("blocking calls are not supported in this version");
      };


      this.nonBlockingCall= function(request, success, failed) {
         var scb   = [];
         var fcb   = [];		
         var op    = request.classname + ":" + request.method;

         if(adf.mf.internal.batchRequest !== undefined)
         {
            var deferedObject = {};

            /* configure up the success and failed callback vectors */
            scb = scb.concat(adf.mf.internal.util.is_array(success)? success : [success]);
            fcb = fcb.concat(adf.mf.internal.util.is_array(failed)?  failed  : [failed ]);

            adf.mf.internal.perf.snapshot("adf.mf.internal.VMChannel.nonBlockingCall", 
            "appending request on the batch request.");

            adf.mf.log.Framework.logp(adf.mf.log.level.FINER, "adf.mf.internal.VMChannel", "nonBlockingCall",
            "appending request on the batch request - actual request is being defered.");
            adf.mf.internal.batchRequest.push(request);

            deferedObject[adf.mf.internal.api.constants.DEFERRED_PROPERTY];

            for(var i = 0; i < scb.length; ++i)
            {
               try
               {
                  scb[i](request, deferedObject);
               }
               catch(se)
               {
                  /* nothing we can do */
               }
            }
         }
         else
         {
            /* configure up the success and failed callback vectors */
            scb = scb.concat([function() {adf.mf.internal.perf.stop("adf.mf.internal.VMChannel.nonBlockingCall", op);}]);
            scb = scb.concat(adf.mf.internal.util.is_array(success)? success : [success]);

            fcb = fcb.concat([function() {adf.mf.internal.perf.stop("adf.mf.internal.VMChannel.nonBlockingCall", op);}]);
            fcb = fcb.concat(adf.mf.internal.errorHandlers);
            fcb = fcb.concat(adf.mf.internal.util.is_array(failed)?  failed  : [failed ]);

            try
            {
               adf.mf.internal.perf.start("adf.mf.internal.VMChannel.nonBlockingCall", op);

               container.internal.device.integration.vmchannel.invoke(10000, request, scb, fcb);  
            }
            catch(e)
            {
               if((! adf.mf.internal.isJavaAvailable()) || (e.name == "TypeError") || (e.name == "ReferenceError"))
               {  // this is when navigator, container.internal.device.integration, or container.internal.device.integration.vmchannel is missing.
                  e = new adf.mf.NoChannelAvailableException();
               }

               for(var i = 0; i < fcb.length; ++i)
               {
                  try
                  {
                     fcb[i](request, e);
                  }
                  catch(fe)
                  {
                     /* nothing we can do */
                  }
               }
            }
         }
      };

      context.setFunction("VMChannel", "blockingCall",    this.blockingCall);
      context.setFunction("VMChannel", "nonBlockingCall", this.nonBlockingCall);	
   };

   adf.mf.security = function(/* Context */ context) {
      this.login = function(username, password, tenantname) {
         if((container.internal.device.integration !== undefined) && (container.internal.device.integration.Security !== undefined))
         {
            container.internal.device.integration.Security.featureLogin(username, password, tenantname);  
         }
         else
         {
            if(adf.mf.log.Framework.isLoggable(adf.mf.log.level.FINE)) 
            {
               adf.mf.log.Framework.logp(adf.mf.log.level.FINE, "Security", "login",
                     ("adfmf - invoking the Security command "));
            }
         }
      };

      this.logout= function() {
         if((container.internal.device.integration !== undefined) && (container.internal.device.integration.Security !== undefined))
         {
            container.internal.device.integration.Security.featureLogout();  
         }
         else
         {
            if(adf.mf.log.Framework.isLoggable(adf.mf.log.level.FINE)) 
            {
               adf.mf.log.Framework.logp(adf.mf.log.level.FINE, "Security", "logout",
                     ("adfmf - invoking the Security command "));
            }
         }
      };

      this.isAuthenticated = function() {
         if((container.internal.device.integration !== undefined) && (container.internal.device.integration.Security !== undefined))
         {
            container.internal.device.integration.Security.featureIsAuthenticated();  
         }
         else
         {
            if(adf.mf.log.Framework.isLoggable(adf.mf.log.level.FINE)) 
            {
               adf.mf.log.Framework.logp(adf.mf.log.level.FINE, "Security", "isAuthenticated",
                     ("adfmf - invoking the Security command "));
            }
         }
      };

      this.cancelLogin = function() {
         if((container.internal.device.integration !== undefined) && (container.internal.device.integration.Security !== undefined))
         {
            container.internal.device.integration.Security.cancelLogin();  
         }
         else
         {
            console.log("adfmf - invoking the Security command ");
         }
      };

      this.isConnectionMultiTenantAware = function(username, password, tenantname, callback) {
         if((container.internal.device.integration !== undefined) && (container.internal.device.integration.Security !== undefined))
         {   
            container.internal.device.integration.Security.featureIsConnectionMultiTenantAware(callback);  
         }
         else
         {
            if(adf.mf.log.Framework.isLoggable(adf.mf.log.level.FINE)) 
            {
               adf.mf.log.Framework.logp(adf.mf.log.level.FINE, "Security", "isConnectionMultiTenantAware",
                     ("adfmf - invoking the Security command "));
            }
         }
      };

      this.getMultiTenantUsername = function(username, password, tenantname, callback) {
         if((container.internal.device.integration !== undefined) && (container.internal.device.integration.Security !== undefined))
         {
            container.internal.device.integration.Security.featureGetMultiTenantUsername(callback);  
         }
         else
         {
            if(adf.mf.log.Framework.isLoggable(adf.mf.log.level.FINE)) 
            {
               adf.mf.log.Framework.logp(adf.mf.log.level.FINE, "Security", "getMultiTenantUsername",
                     ("adfmf - invoking the Security command "));
            }
         }
      };

      this.getLoginViewInitData = function(username, password, tenantname, success, failed) {
         try
         {
            if(adf.mf.log.Framework.isLoggable(adf.mf.log.level.FINE)) 
            {
               adf.mf.log.Framework.logp(adf.mf.log.level.FINE, "Security", "getLoginViewInitData", "invoking security command.");
            }
            
            container.internal.device.integration.Security.getLoginViewInitData(success, failed);
         }
         catch(e)
         {
            if(adf.mf.log.Framework.isLoggable(adf.mf.log.level.WARNING)) 
            {
               adf.mf.log.Framework.logp(adf.mf.log.level.WARNING, "Security", "getLoginViewInitData", 
                                         ("Security.getLoginViewInitData was not invoked (error="+e+")"));
            }
         }
      };

      context.setFunction("Security", "cancelLogin",                  this.cancelLogin);
      context.setFunction("Security", "login",                        this.login);
      context.setFunction("Security", "logout",                       this.logout);
      context.setFunction("Security", "isAuthenticated",              this.isAuthenticated);
      context.setFunction("Security", "isConnectionMultiTenantAware", this.isConnectionMultiTenantAware);
      context.setFunction("Security", "getMultiTenantUsername",       this.getMultiTenantUsername);
      context.setFunction("Security", "getLoginViewInitData",         this.getLoginViewInitData);	
   };
})();

/////////////////////////////////////// end of /Users/buildprocess/HudsonHome/jobs/adfmf-v11-11.1.2.4.1-tip/workspace/Container/JavaScript/ADF/js/JavaScriptContext.js///////////////////////////////////////



/////////////////////////////////////// start of /Users/buildprocess/HudsonHome/jobs/adfmf-v11-11.1.2.4.1-tip/workspace/Container/JavaScript/ADF/js/JavaScripteModel.js///////////////////////////////////////

/**
 * 
 */

window.JavaScriptModel = function() {
	
};

/////////////////////////////////////// end of /Users/buildprocess/HudsonHome/jobs/adfmf-v11-11.1.2.4.1-tip/workspace/Container/JavaScript/ADF/js/JavaScripteModel.js///////////////////////////////////////



/////////////////////////////////////// start of /Users/buildprocess/HudsonHome/jobs/adfmf-v11-11.1.2.4.1-tip/workspace/Container/JavaScript/ADF/js/ContainerIntegration.js///////////////////////////////////////


var adf                    = window.adf                 || {};
adf.mf                     = adf.mf                     || {};
adf.mf.api                 = adf.mf.api                 || {};
adf.mf.el                  = adf.mf.el                  || {};
adf.mf.locale              = adf.mf.locale              || {};
adf.mf.log                 = adf.mf.log                 || {};
adf.mf.resource            = adf.mf.resource            || {};
adf.mf.util                = adf.mf.util                || {};

adf.mf.internal            = adf.mf.internal            || {};
adf.mf.internal.api        = adf.mf.internal.api        || {};
adf.mf.internal.el         = adf.mf.internal.el         || {};
adf.mf.internal.el.parser  = adf.mf.internal.el.parser  || {};
adf.mf.internal.locale     = adf.mf.internal.locale     || {};
adf.mf.internal.log        = adf.mf.internal.log        || {};
adf.mf.internal.mb         = adf.mf.internal.mb         || {};
adf.mf.internal.perf       = adf.mf.internal.perf       || {};
adf.mf.internal.perf.story = adf.mf.internal.perf.story || {};
adf.mf.internal.resource   = adf.mf.internal.resource   || {};
adf.mf.internal.util       = adf.mf.internal.util       || {};



(function() {
  var ADFMF_CONTAINER_UTILITIES          = "oracle.adfmf.framework.api.AdfmfContainerUtilities"
  var ADFMF_CONTAINER_UTILITIES_INTERNAL = "oracle.adfmf.framework.internal.AdfmfContainerUtilitiesInternal";
  var ASYNC_SUCCESS_CALLBACK             = "asyncContainerJavaScriptFunctionResponseSuccess";
  var ASYNC_FAILED_CALLBACK              = "asyncContainerJavaScriptFunctionResponseFailed";
  
   /**
    * Checks and obtains new configuration if available.
    * <br/>
    * The associated AdfmfContainerUtilites method that is invoked
    * is checkForNewConfiguration, which is defined
    * as:
    * public static void checkForNewConfiguration() throws AdfException
    * <br/>
    * so the associated JavaScript  function will be defined as
    * <br/>
    * adf.mf.api.checkForNewConfiguration = function(success, failed)
    * <br/>
    * The success and failed callbacks were added so the return value
    * and exception could be passed back to the JavaScript  calling code.
    * <br/>
    * <b>success callback</b> must be in the form of 
    *    function(request, response) where the request 
    *    contains the original request and the response
    *    contains the associated AdfmfContainerUtilities
    *    method's return value.
    *  <br/>i.e.<br/>void
    *  <br/>
    *  <b>failed callback</b> must be in the form of 
    *    function(request, response) where the request 
    *    contains the original request and the response
    *    contains the error (AdfException).
    * <br/>
    * <b>Example</b>
    * <pre>
   adf.mf.api.checkForNewConfiguration(
          function(req, res) { alert("checkForNewConfiguration complete"); },
          function(req, res) { alert("checkForNewConfiguration failed with " + adf.mf.util.stringify(res); }
   );
    * </pre>
    */
   adf.mf.api.checkForNewConfiguration = function(success, failed) 
   {
      adf.mf.api.invokeMethod(ADFMF_CONTAINER_UTILITIES, "checkForNewConfiguration", success, failed);
   };

   /**
    * Gets an array of <code>FeatureInformation</code> objects that provide
    * information about the features that are available in this session of the
    * ADF Mobile application and should be displayed on a custom springboard.
    * These features have already been filtered by the evaluation of constraints.
    * These are the features that would normally be displayed on the default
    * springboard.
    * <br/>
    * The associated AdfmfContainerUtilites method that is invoked
    * is getFeatures, which is defined
    * as:
    * public static FeatureInformation[] getFeatures() throws AdfException
    * <br/>
    * so the associated JavaScript  function will be defined as
    * <br/>
    * adf.mf.api.getFeatures = function(success, failed)
    * <br/>
    * The success and failed callbacks were added so the return value
    * and exception could be passed back to the JavaScript  calling code.
    * <br/>
    * <b>success callback</b> must be in the form of 
    *    function(request, response) where the request 
    *    contains the original request and the response
    *    contains the associated AdfmfContainerUtilities
    *    method's return value.
    *  <br/>i.e.<br/>
    * 
    *         An array of <code>FeatureInformation</code> objects each
    *         representing a feature that is available. This will include the
    *         feature id, the feature name, a path to the feature icon and a path
    *         to the feature image. Normally a springboard will display the name
    *         of the feature and the image for that feature.
    *         
    *  <br/>
    *  <b>failed callback</b> must be in the form of 
    *    function(request, response) where the request 
    *    contains the original request and the response
    *    contains the error (AdfException).
    * <br/>
    * <b>Example</b>
    * <pre>
   adf.mf.api.getFeatures(
          function(req, res) { alert("getFeatures complete"); },
          function(req, res) { alert("getFeatures failed with " + adf.mf.util.stringify(res); }
   );
    * </pre>
    */
   adf.mf.api.getFeatures = function(success, failed) 
   {
      adf.mf.api.invokeMethod(ADFMF_CONTAINER_UTILITIES, "getFeatures", success, failed);
   };

   /**
    * Gets <code>ApplicatiaonInformation</code> object containing the information
    * about the application. This can be used to get the application name for a
    * custom springboard. Additional information such as vendor, version and
    * application id are provided as well.
    * <br/>
    * The associated AdfmfContainerUtilites method that is invoked
    * is getApplicationInformation, which is defined
    * as:
    * public static ApplicatiaonInformation getApplicationInformation() throws AdfException
    * <br/>
    * so the associated JavaScript  function will be defined as
    * <br/>
    * adf.mf.api.getApplicationInformation = function(success, failed)
    * <br/>
    * The success and failed callbacks were added so the return value
    * and exception could be passed back to the JavaScript  calling code.
    * <br/>
    * <b>success callback</b> must be in the form of 
    *    function(request, response) where the request 
    *    contains the original request and the response
    *    contains the associated AdfmfContainerUtilities
    *    method's return value.
    *  <br/>i.e.<br/>
    * 
    *         A <code>ApplicatiaonInformation</code> object containing
    *         application level metadata. This includes application name, vendor,
    *         version and application id.
    * 
    *  <br/>
    *  <b>failed callback</b> must be in the form of 
    *    function(request, response) where the request 
    *    contains the original request and the response
    *    contains the error (AdfException).
    * <br/>
    * <b>Example</b>
    * <pre>
   adf.mf.api.getApplicationInformation(
          function(req, res) { alert("getApplicationInformation complete"); },
          function(req, res) { alert("getApplicationInformation failed with " + adf.mf.util.stringify(res); }
   );
    * </pre>
    */
   adf.mf.api.getApplicationInformation = function(success, failed) 
   {
      adf.mf.api.invokeMethod(ADFMF_CONTAINER_UTILITIES, "getApplicationInformation", success, failed);
   };

   /**
    * Activates the feature with the given ID.
    * <br/>
    * The associated AdfmfContainerUtilites method that is invoked
    * is gotoFeature, which is defined
    * as:
    * public static void gotoFeature(String featureId) throws AdfException
    * <br/>
    * so the associated JavaScript  function will be defined as
    * <br/>
    * adf.mf.api.gotoFeature = function(featureId, success, failed)
    * <br/>
    * The success and failed callbacks were added so the return value
    * and exception could be passed back to the JavaScript  calling code.
    * <br/>
    * @param featureId
    *          ID of feature to activate
    *          
    * <b>success callback</b> must be in the form of 
    *    function(request, response) where the request 
    *    contains the original request and the response
    *    contains the associated AdfmfContainerUtilities
    *    method's return value.
    *  <br/>i.e.<br/>void
    *  <br/>
    *  <b>failed callback</b> must be in the form of 
    *    function(request, response) where the request 
    *    contains the original request and the response
    *    contains the error (AdfException).
    * <br/>
    * <b>Example</b>
    * <pre>
   adf.mf.api.gotoFeature("feature0",
          function(req, res) { alert("gotoFeature complete"); },
          function(req, res) { alert("gotoFeature failed with " + adf.mf.util.stringify(res); }
   );
    * </pre>
    */
   adf.mf.api.gotoFeature = function(/* String */ featureId, success, failed) 
   {
      adf.mf.api.invokeMethod(ADFMF_CONTAINER_UTILITIES, "gotoFeature", featureId, success, failed);
   };


   /**
    * Activates the springboard.
    * <br/>
    * The associated AdfmfContainerUtilites method that is invoked
    * is gotoSpringboard, which is defined
    * as:
    * public static void gotoSpringboard() throws AdfException
    * <br/>
    * so the associated JavaScript  function will be defined as
    * <br/>
    * adf.mf.api.gotoSpringboard = function(success, failed)
    * <br/>
    * The success and failed callbacks were added so the return value
    * and exception could be passed back to the JavaScript  calling code.
    * <br/>
    * <b>success callback</b> must be in the form of 
    *    function(request, response) where the request 
    *    contains the original request and the response
    *    contains the associated AdfmfContainerUtilities
    *    method's return value.
    *  <br/>i.e.<br/>void
    *  <br/>
    *  <b>failed callback</b> must be in the form of 
    *    function(request, response) where the request 
    *    contains the original request and the response
    *    contains the error (AdfException).
    * <br/>
    * <b>Example</b>
    * <pre>
   adf.mf.api.gotoSpringboard(
          function(req, res) { alert("gotoSpringboard complete"); },
          function(req, res) { alert("gotoSpringboard failed with " + adf.mf.util.stringify(res); }
   );
    * </pre>
    */
   adf.mf.api.gotoSpringboard = function(success, failed) 
   {
      adf.mf.api.invokeMethod(ADFMF_CONTAINER_UTILITIES, "gotoSpringboard", success, failed);
   };

   /**
    * Activates the default feature.
    * <br/>
    * The associated AdfmfContainerUtilites method that is invoked
    * is gotoDefaultFeature, which is defined
    * as:
    * public static void gotoDefaultFeature() throws AdfException
    * <br/>
    * so the associated JavaScript  function will be defined as
    * <br/>
    * adf.mf.api.gotoDefaultFeature = function(success, failed)
    * <br/>
    * The success and failed callbacks were added so the return value
    * and exception could be passed back to the JavaScript  calling code.
    * <br/>
    * <b>success callback</b> must be in the form of 
    *    function(request, response) where the request 
    *    contains the original request and the response
    *    contains the associated AdfmfContainerUtilities
    *    method's return value.
    *  <br/>i.e.<br/>void
    *  <br/>
    *  <b>failed callback</b> must be in the form of 
    *    function(request, response) where the request 
    *    contains the original request and the response
    *    contains the error (AdfException).
    * <br/>
    * <b>Example</b>
    * <pre>
   adf.mf.api.gotoDefaultFeature(
          function(req, res) { alert("gotoDefaultFeature complete"); },
          function(req, res) { alert("gotoDefaultFeature failed with " + adf.mf.util.stringify(res); }
   );
    * </pre>
    */
   adf.mf.api.gotoDefaultFeature = function(success, failed) 
   {
      adf.mf.api.invokeMethod(ADFMF_CONTAINER_UTILITIES, "gotoDefaultFeature", success, failed);
   };


   /**
    * Resets the feature with the given ID.
    * <br/>
    * The associated AdfmfContainerUtilites method that is invoked
    * is resetFeature, which is defined
    * as:
    * public static void resetFeature(String featureId) throws AdfException
    * <br/>
    * so the associated JavaScript  function will be defined as
    * <br/>
    * adf.mf.api.resetFeature = function(featureId, success, failed)
    * <br/>
    * The success and failed callbacks were added so the return value
    * and exception could be passed back to the JavaScript  calling code.
    * <br/>
    * @param featureId
    *          ID of feature to reset
    *          
    * <b>success callback</b> must be in the form of 
    *    function(request, response) where the request 
    *    contains the original request and the response
    *    contains the associated AdfmfContainerUtilities
    *    method's return value.
    *  <br/>i.e.<br/>void
    *  <br/>
    *  <b>failed callback</b> must be in the form of 
    *    function(request, response) where the request 
    *    contains the original request and the response
    *    contains the error.
    *         
    * @throws AdfException
    * <br/>
    * <b>Example</b>
    * <pre>
   adf.mf.api.resetFeature("feature0",
          function(req, res) { alert("resetFeature complete"); },
          function(req, res) { alert("resetFeature failed with " + adf.mf.util.stringify(res); }
   );
    * </pre>
    */
   adf.mf.api.resetFeature = function(/* String */ featureId, success, failed) 
   {
      adf.mf.api.invokeMethod(ADFMF_CONTAINER_UTILITIES, "resetFeature", featureId, success, failed);
   };


   /**
    * Hides navigation bar.
    * <br/>
    * The associated AdfmfContainerUtilites method that is invoked
    * is hideNavigationBar, which is defined
    * as:
    * public static void hideNavigationBar() throws AdfException
    * <br/>
    * so the associated JavaScript  function will be defined as
    * <br/>
    * adf.mf.api.hideNavigationBar = function(success, failed)
    * <br/>
    * The success and failed callbacks were added so the return value
    * and exception could be passed back to the JavaScript  calling code.
    * <br/>
    * <b>success callback</b> must be in the form of 
    *    function(request, response) where the request 
    *    contains the original request and the response
    *    contains the associated AdfmfContainerUtilities
    *    method's return value.
    *  <br/>i.e.<br/>void
    *  <br/>
    *  <b>failed callback</b> must be in the form of 
    *    function(request, response) where the request 
    *    contains the original request and the response
    *    contains the error.
    *         
    * @throws AdfException
    * <br/>
    * <b>Example</b>
    * <pre>
   adf.mf.api.hideNavigationBar(
          function(req, res) { alert("hideNavigationBar complete"); },
          function(req, res) { alert("hideNavigationBar failed with " + adf.mf.util.stringify(res); }
   );
    * </pre>
    */
   adf.mf.api.hideNavigationBar = function(success, failed) 
   {
      adf.mf.api.invokeMethod(ADFMF_CONTAINER_UTILITIES, "hideNavigationBar", success, failed);
   };

   /**
    * Shows navigation bar.
    * <br/>
    * The associated AdfmfContainerUtilites method that is invoked
    * is showNavigationBar, which is defined
    * as:
    * public static void showNavigationBar() throws AdfException
    * <br/>
    * so the associated JavaScript  function will be defined as
    * <br/>
    * adf.mf.api.showNavigationBar = function(success, failed)
    * <br/>
    * The success and failed callbacks were added so the return value
    * and exception could be passed back to the JavaScript  calling code.
    * <br/>
    * <b>success callback</b> must be in the form of 
    *    function(request, response) where the request 
    *    contains the original request and the response
    *    contains the associated AdfmfContainerUtilities
    *    method's return value.
    *  <br/>i.e.<br/>void
    *  <br/>
    *  <b>failed callback</b> must be in the form of 
    *    function(request, response) where the request 
    *    contains the original request and the response
    *    contains the error.
    *         
    * @throws AdfException
    * <br/>
    * <b>Example</b>
    * <pre>
   adf.mf.api.showNavigationBar(
          function(req, res) { alert("showNavigationBar complete"); },
          function(req, res) { alert("showNavigationBar failed with " + adf.mf.util.stringify(res); }
   );
    * </pre>
    */
   adf.mf.api.showNavigationBar = function(success, failed) 
   {
      adf.mf.api.invokeMethod(ADFMF_CONTAINER_UTILITIES, "showNavigationBar", success, failed);
   };


   /**
    * Invokes a Javascript method with the given arguments on the specified
    * feature. Returns the result of the method execution.
    * <br/>
    * The associated AdfmfContainerUtilites method that is invoked
    * is invokeContainerJavaScriptFunction, which is defined
    * as:
    * public static Object invokeContainerJavaScriptFunction(String featureId, String methodName, Object[] args) throws AdfException
    * <br/>
    * so the associated JavaScript  function will be defined as
    * <br/>
    * adf.mf.api.showNavigationBar = function(success, failed)
    * <br/>
    * The success and failed callbacks were added so the return value
    * and exception could be passed back to the JavaScript  calling code.
    * <br/>
    * @param featureId
    *          ID of feature on which to invoke the method
    * @param methodName
    *          method name
    * @param args
    *          array of arguments to be passed to method
    *          
    * <b>success callback</b> must be in the form of 
    *    function(request, response) where the request 
    *    contains the original request and the response
    *    contains the associated AdfmfContainerUtilities
    *    method's return value.
    *  <br/>i.e.<br/>Object
    *  <br/>
    *  <b>failed callback</b> must be in the form of 
    *    function(request, response) where the request 
    *    contains the original request and the response
    *    contains the error.
    *         
    * @throws AdfException
    * <br/>
    * <b>Example</b>
    *  <ul>
    *  <li>included a simple appFunction.js file to feature1 (by adding it to feature1 content's include in JDeveloper).</li>
    *  <li>added calls to adf.mf.api.invokeContainerJavaScriptFunction to your code</li>
    *  </ul>
    * <br/>
    * <b>appFunctions.js</b>
    * <pre>
    (function() 
    {
       if (!window.application) window.application = {};

       application.testFunction = function()
       {
          var args = arguments;

          alert("APP ALERT " + args.length + " ");
          return "application.testFunction - passed";
       };
    })();
    * </pre>
    * <br/>
    * <pre>
   adf.mf.api.invokeContainerJavaScriptFunction("feature1",
          function(req, res) { alert("invokeContainerJavaScriptFunction complete"); },
          function(req, res) { alert("invokeContainerJavaScriptFunction failed with " + adf.mf.util.stringify(res); }
   or
   adf.mf.api.invokeContainerJavaScriptFunction("feature1", [ "P1" ], 
          function(req, res) { alert("invokeContainerJavaScriptFunction complete"); },
          function(req, res) { alert("invokeContainerJavaScriptFunction failed with " + adf.mf.util.stringify(res); }
   );
   or
   adf.mf.api.invokeContainerJavaScriptFunction("feature1", [ "P1", "P2" ], 
          function(req, res) { alert("invokeContainerJavaScriptFunction complete"); },
          function(req, res) { alert("invokeContainerJavaScriptFunction failed with " + adf.mf.util.stringify(res); }
   );
    * </pre>
    * <br/>
    * Now when the user presses the button they will see three alerts (from the appFunctions.js):
    * <pre>
        APP ALERT 0
        APP ALERT 1
        APP ALERT 2
    * </pre>
    */
   adf.mf.api.invokeContainerJavaScriptFunction = function(/* String */ featureId, /* String */ methodName, /* Object[] */ args, success, failed) 
   {
      adf.mf.api.invokeMethod(ADFMF_CONTAINER_UTILITIES, "invokeContainerJavaScriptFunction", featureId, methodName, args, success, failed);
   };


   /**
    * Invokes a native method on the specified class with the given arguments.
    * Returns the result of method execution.
    * 
    * @param className
    *          class name
    * @param methodName
    *          method name
    * @param args
    *          array of arguments to be passed to method
    * 
    * <b>success callback</b> must be in the form of 
    *    function(request, response) where the request 
    *    contains the original request and the response
    *    contains the associated AdfmfContainerUtilities
    *    method's return value.
    *  <br/>i.e.<br/>Object
    *  <br/>
    *  <b>failed callback</b> must be in the form of 
    *    function(request, response) where the request 
    *    contains the original request and the response
    *    contains the error.
    *         
    * @throws AdfException
    */
   adf.mf.api.invokeContainerMethod = function(/* String */ classname, /* String */ methodName, /* Object[] */ args, success, failed) 
   {
      adf.mf.api.invokeMethod(ADFMF_CONTAINER_UTILITIES, "invokeContainerMethod", classname, methodName, args, success, failed);
   };

   /**
    * Returns the feature information for the passed in feature id.
    * <br/>
    * The associated AdfmfContainerUtilites method that is invoked
    * is getFeatureById, which is defined
    * as:
    * public static FeatureInformation getFeatureById(String featureId) throws AdfException
    * <br/>
    * so the associated JavaScript  function will be defined as
    * <br/>
    * adf.mf.api.getFeatureById = function(featureId, success, failed)
    * <br/>
    * The success and failed callbacks were added so the return value
    * and exception could be passed back to the JavaScript  calling code.
    * <br/>
    * @param featureId
    *          ID of the feature to retrieve
    * 
    * <b>success callback</b> must be in the form of 
    *    function(request, response) where the request 
    *    contains the original request and the response
    *    contains the associated AdfmfContainerUtilities
    *    method's return value.
    *  <br/>i.e.<br/>Feature
    *  <br/>
    *  <b>failed callback</b> must be in the form of 
    *    function(request, response) where the request 
    *    contains the original request and the response
    *    contains the error.
    *         
    * @throws AdfException
    * <br/>
    * <b>Example</b>
    * <pre>
   adf.mf.api.getFeatureById("feature.id",
          function(req, res) { alert("getFeatureById complete"); },
          function(req, res) { alert("getFeatureById failed with " + adf.mf.util.stringify(res); }
   );
    * </pre>
    */
   adf.mf.api.getFeatureById = function(/* String */ featureId, success, failed) 
   {
      adf.mf.api.invokeMethod(ADFMF_CONTAINER_UTILITIES, "getFeatureById", featureId, success, failed);
   };

   /**
    * Returns the feature information for the passed in feature name.
    * <br/>
    * The associated AdfmfContainerUtilites method that is invoked
    * is getFeatureByName, which is defined
    * as:
    * public static FeatureInformation getFeatureByName(String featureName) throws AdfException
    * <br/>
    * so the associated JavaScript  function will be defined as
    * <br/>
    * adf.mf.api.getFeatureByName = function(featureName, success, failed)
    * <br/>
    * The success and failed callbacks were added so the return value
    * and exception could be passed back to the JavaScript  calling code.
    * <br/>
    * @param featureName
    *          Name of the feature to retrieve
    * 
    * <b>success callback</b> must be in the form of 
    *    function(request, response) where the request 
    *    contains the original request and the response
    *    contains the associated AdfmfContainerUtilities
    *    method's return value.
    *  <br/>i.e.<br/>void
    *  <br/>
    *  <b>failed callback</b> must be in the form of 
    *    function(request, response) where the request 
    *    contains the original request and the response
    *    contains the error.
    *         
    * @throws AdfException
    * <br/>
    * <b>Example</b>
    * <pre>
   adf.mf.api.getFeatureByName("feature.name",
          function(req, res) { alert("getFeatureByName complete"); },
          function(req, res) { alert("getFeatureByName failed with " + adf.mf.util.stringify(res); }
   );
    * </pre>
    */
   adf.mf.api.getFeatureByName = function(/* String */ featureName, success, failed) 
   {
      adf.mf.api.invokeMethod(ADFMF_CONTAINER_UTILITIES, "getFeatureByName", featureName, success, failed);
   };

   /**
    * internal api for invoke Java 
    * e.g. adf.mf.internal.api.invokeMethod(commId, classname, methodname, param1, param2, ... , paramN ,successCallback, failedCallback);
    */

   adf.mf.internal.api.invokeMethod = function()
   {
      argc   = arguments.length;
      params = new Array();

      for (var i=3; i < argc-2; i++) 
      {
         params[i-3] = arguments[i];
      }

      var request = { "classname"  : arguments[1], /* clazz  */
            "method"     : arguments[2], /* method */
            "params"     : params };

      adf.mf.internal.context.invokeJavaMethod(/* CommId */ arguments[0], request, arguments[argc-2], arguments[argc-1]);
   };

   /**
    * The framework enables you to display the device's e-mail interface, and optionally pre-populate certain fields:
    * 
    *  @param options
    *     is a JSON object with the following optional properties:
    *     <ul>
    *     <li>to: recipients (comma-separated)</li>
    *     <li>cc: CC recipients (comma-separated)</li>
    *     <li>subject: message subject</li>
    *     <li>body: message body</li>
    *     <li>bcc: BCC recipients (comma-separated)</li>
    *     <li>attachments: list of filenames to attach to the e-mail (comma-separated)</li>
    *     <li>mimeTypes:
    *     <ul><li><b>iOS</b>: List of MIME types to use for the attachments (comma-separated). 
    *     Specify null to let the framework automatically determine the MIME types. 
    *     It is also possible to only specify the MIME types for selected attachments; see examples below.</li>
    *     <li><b>Android</b>: MIME type in Android isn't true MIME type but just a way for Android to filter 
    *     applications to be shown in the application chooser dialog. But empty MIME type doesn't work 
    *     and throws exception. So if no MIME type is passed in, we use "plain/text" by default. Also, if 
    *     there are multiple attachment types, user doesn't need to provide multiple MIME types, but can 
    *     provide just most suitable MIME type (as per Android documentation). That being said, if the user 
    *     has an application which is being deployed to both iOS and Android, they can pass in the comma-separated 
    *     list of mime types and Android will still work fine.</li></ul>
    *     </li>
    *     </ul>
    *  <br/>
    *  After this interface is displayed, the user can choose to either send the e-mail or discard it. Note that it 
    *  is not possible to automatically send the e-mail due to device/carrier restrictions; only the end user can actually 
    *  send the e-mail. The device must also have at least one e-mail account configured to send e-mail; otherwise, an 
    *  error will be displayed indicating that no e-mail accounts could be found.
    *  <br/>
    *  Examples:
    *
    * Populate an e-mail to 'john.doe@foo.com', copy 'jane.doe@bar.com', with the subject 'Test message', 
    * and the body 'This is a test message'
    * <br/>
    * <pre>
   adf.mf.api.sendEmail({to: "john.doe@foo.com",
                         cc: "jane.doe@bar.com",
                         subject: "Test message",
                         body: "This is a test message"},
                        success, failed);
    * </pre>
    * <br/>
    * Taking the same example, but now adding a BCC to 'mary.may@another.com' and 'lary.day@another.com'
    * and attaching two files.<br/>
    * <b>NOTE:</b> By not specifying a value for the mimeTypes parameter, you are telling the framework to automatically 
    * determine the MIME type for each of the attachments
    * <br/>
    * <pre>
   adf.mf.api.sendEmail({to: "john.doe@foo.com",
                         cc: "jane.doe@bar.com",
                         bcc: "mary.may@another.com,lary.day@another.com"
                         subject: "Test message",
                         attachments: "path/to/file1.txt,path/to/file2.png"},
                        success, failed);
    * </pre>
    * 
    * <b>success callback</b> must be in the form of 
    *    function(request, response) where the request 
    *    contains the original request and the response
    *    contains the associated AdfmfContainerUtilities
    *    method's return value.
    *  <br/>i.e.<br/>void
    *  <br/>
    *  <b>failed callback</b> must be in the form of 
    *    function(request, response) where the request 
    *    contains the original request and the response
    *    contains the error.
    *         
    * @throws AdfException
    */
   adf.mf.api.sendEmail = function(/* JSON */ options, success, failed)
   {
      if (options)
      {
         var attachments = options["attachments"];
         var mimeTypes = options["mimeTypes"];
         if (attachments || mimeTypes)
         {
            var attachmentsArray = attachments ? attachments.split(",") : [];
            var mimeTypesArray = mimeTypes ? mimeTypes.split(",") : [];
            var numMimeTypes = mimeTypesArray.length;
            var numAttachments = attachmentsArray.length;
            if (numMimeTypes > 0 && numAttachments != numMimeTypes)
            {
               // When attachments and MIME types are both specified, the number of each
               // must match.
               if (failed != null)
               {
                  var rmsg = adf.mf.internal.resource.getResourceStringImpl("ADFErrorBundle", "ERR_MIMETYPES_NOTEQUAL_ATTACHMENTS", [numMimeTypes, numAttachments]);
                  failed(rmsg);
                  return;
               }
            }
         }
      }
      Cordova.exec( success, failed, "ADFMobileMessaging", "sendEmail", [options]);
   };

   // This variant of the sendEmail API is ONLY used when invoking sendEmail from Embedded Java code
  adf.mf.internal.api.sendEmail = function (commId, requestId, emailOptions) {  
    try {
      adf.mf.api.sendEmail(emailOptions, /* Options to pre-populate e-mail dialog */

        function(result) /* Success callback */
        {
          var responseData = result || {};
          try 
          {
            adf.mf.internal.api.invokeMethod(commId, ADFMF_CONTAINER_UTILITIES_INTERNAL, ASYNC_SUCCESS_CALLBACK, requestId, responseData, function() {}, function() {});
          }
          catch (se)
          {
            adf.mf.log.logInfoResource("ADFInfoBundle", adf.mf.log.level.SEVERE,
              "adf.mf.internal.api.sendEmail", "MSG_ERROR_IN_REQUEST", ASYNC_SUCCESS_CALLBACK, se);
          }
        },

        function(result) /* Error callback */
        {
          var responseData = result || {};
          try 
          {
            adf.mf.internal.api.invokeMethod(commId, ADFMF_CONTAINER_UTILITIES_INTERNAL, ASYNC_FAILED_CALLBACK, requestId, responseData, function() {}, function() {});
          }
          catch (se)
          {
            adf.mf.log.logInfoResource("ADFInfoBundle", adf.mf.log.level.SEVERE,
              "adf.mf.internal.api.sendEmail", "MSG_ERROR_IN_REQUEST", ASYNC_FAILED_CALLBACK, se);
          }
        });
     }
     catch(se)
     {
        adf.mf.log.logInfoResource("ADFInfoBundle", adf.mf.log.level.SEVERE,
          "adf.mf.api.sendEmail", "MSG_EXCEPTION", se);;
        adf.mf.internal.api.invokeMethod(commId, ADFMF_CONTAINER_UTILITIES_INTERNAL, ASYNC_FAILED_CALLBACK, requestId, msg, function() {}, function() {});
    }
  };



   /**
    * The framework enables you to display the device's text messaging (SMS) interface, and optionally pre-populate certain fields:
    * 
    *  @param options
    *     is a JSON object with the following optional properties:
    *     <ul>
    *     <li>to: recipients (comma-separated)</li>
    *     <li>body: message body</li>
    *     </ul>
    *  <br/>
    *  After this interface is displayed, the user can choose to either send the 
    *  SMS or discard it. Note that it is not possible to automatically send the 
    *  SMS due to device/carrier restrictions; only the end user can actually send the SMS.
    *  <br/>
    *  Examples:
    *
    * Populate an SMS message to 'john.doe@foo.com' with the body 'This is a test message'
    * <br/>
    * <pre>
    adf.mf.api.sendSMS({to: "john.doe@foo.com",
                        body: "This is a test message"},
                       success, failed);
    * </pre>
    * 
    * <b>success callback</b> must be in the form of 
    *    function(request, response) where the request 
    *    contains the original request and the response
    *    contains the associated AdfmfContainerUtilities
    *    method's return value.
    *  <br/>i.e.<br/>void
    *  <br/>
    *  <b>failed callback</b> must be in the form of 
    *    function(request, response) where the request 
    *    contains the original request and the response
    *    contains the error.
    *         
    * @throws AdfException
    */
   adf.mf.api.sendSMS = function(/* JSON */ options, success, failed)
   {
     if (adf.mf.log.Framework.isLoggable(adf.mf.log.level.FINE)) 
      {
        adf.mf.log.Framework.logp(adf.mf.log.level.FINE, "adf.mf.api.getDeviceProperties",
              "CORDOVA_DEBUG", "Inside the ContainterIntegration.js invoking ADFMobileMessaging.sendSMS Cordova plugin");
      }
      Cordova.exec( success, failed, "ADFMobileMessaging", "sendSMS", [options]);
   };

   // This variant of the sendSMS API is ONLY used when invoking sendSMS from Embedded Java code
   adf.mf.internal.api.sendSMS = function (commId, requestId, smsOptions) {
     try {
      adf.mf.api.sendSMS(smsOptions, /* Options to pre-populate SMS dialog */

        function(result) /* Success callback */
        {
          var responseData = result || {};
          try
          {
            adf.mf.internal.api.invokeMethod(commId, ADFMF_CONTAINER_UTILITIES_INTERNAL, ASYNC_SUCCESS_CALLBACK, requestId, responseData, function() {}, function() {});
          }
          catch (se)
          {
            adf.mf.log.logInfoResource("ADFInfoBundle", adf.mf.log.level.SEVERE,
              "adf.mf.internal.api.sendSMS", "MSG_ERROR_IN_REQUEST", ASYNC_SUCCESS_CALLBACK, se);
          }
        },

        function(result) /* Error callback */
        {
          var responseData = result || {};
          try
          {
            adf.mf.internal.api.invokeMethod(commId, ADFMF_CONTAINER_UTILITIES_INTERNAL, ASYNC_FAILED_CALLBACK, requestId, responseData, function() {}, function() {});
          }
          catch (se)
          {
            adf.mf.log.logInfoResource("ADFInfoBundle", adf.mf.log.level.SEVERE,
              "adf.mf.internal.api.sendSMS", "MSG_ERROR_IN_REQUEST", ASYNC_FAILED_CALLBACK, se);
          }
        });
    }
    catch(se)
    {
      adf.mf.log.logInfoResource("ADFInfoBundle", adf.mf.log.level.SEVERE,
        "adf.mf.api.sendSMS", "MSG_EXCEPTION", se);
      adf.mf.internal.api.invokeMethod(commId, ADFMF_CONTAINER_UTILITIES_INTERNAL, ASYNC_FAILED_CALLBACK, requestId, msg, function() {}, function() {});
    }
  };

  adf.mf.api.getDeviceProperties = function(success, failed)
  {
    if (adf.mf.log.Framework.isLoggable(adf.mf.log.level.FINE)) 
    {
      adf.mf.log.Framework.logp(adf.mf.log.level.FINE, "adf.mf.api.getDeviceProperties",
            "CORDOVA_DEBUG", "Inside the ContainterIntegration.js invoking ADFMobileDeviceProperties.getDeviceProperties Cordova plugin");
    }
    Cordova.exec( success, failed, "ADFMobileDeviceProperties", "getDeviceProperties", []);
  };

  adf.mf.internal.api.getCurrentPosition = function (commId, requestId) {
    try {
      navigator.geolocation.getCurrentPosition(
      
        function (data) {
          var position = data || {};
          try
          {
            adf.mf.internal.api.invokeMethod(commId, ADFMF_CONTAINER_UTILITIES_INTERNAL, ASYNC_SUCCESS_CALLBACK,
               requestId, position, function () {}, function () {});
          }
          catch (se)
          {
             adf.mf.log.logInfoResource("ADFInfoBundle", adf.mf.log.level.SEVERE,
              "adf.mf.internal.api.getCurrentPosition", "MSG_ERROR_IN_REQUEST", ASYNC_SUCCESS_CALLBACK, se);
          }
        },

        function (data) {
          var message = ((data != null) && (data !== undefined)) ? data.message : "unknown error";
          try
          {
            adf.mf.internal.api.invokeMethod(commId, ADFMF_CONTAINER_UTILITIES_INTERNAL, ASYNC_FAILED_CALLBACK,
               requestId, message, function () {}, function () {});
          }
          catch (se)
          {
            adf.mf.log.logInfoResource("ADFInfoBundle", adf.mf.log.level.SEVERE,
              "adf.mf.internal.api.getCurrentPosition", "MSG_ERROR_IN_REQUEST", ASYNC_FAILED_CALLBACK, se);
          }
      });
    }
    catch(se)
    {
      adf.mf.log.logInfoResource("ADFInfoBundle", adf.mf.log.level.SEVERE,
        "navigator.geolocation.getCurrentPosition", "MSG_EXCEPTION", se);
      adf.mf.internal.api.invokeMethod(commId, ADFMF_CONTAINER_UTILITIES_INTERNAL, ASYNC_FAILED_CALLBACK, requestId, msg, function() {}, function() {});
    }
  };

  adf.mf.internal.api.watchPosition = function (commId, requestId, userWatchId, geolocationOptions) { // success callback
    var firstTime = true;
    try
    {
      var watchId = navigator.geolocation.watchPosition(
      
        function (data) {
          var position = data || {};
          if (firstTime) 
          {  // unblock the calling thread only on the first callback.
            try
            {
              adf.mf.internal.api.invokeMethod(commId, ADFMF_CONTAINER_UTILITIES_INTERNAL, ASYNC_SUCCESS_CALLBACK,
                    requestId, String(watchId), function () {}, function () {});
            }
            catch (se)
            {
              adf.mf.log.logInfoResource("ADFInfoBundle", adf.mf.log.level.SEVERE,
              "adf.mf.internal.api.watchPosition", "MSG_ERROR_IN_REQUEST", ASYNC_SUCCESS_CALLBACK, se);
            }
            firstTime = false;
          }
          try
          {
            adf.mf.api.invokeMethod("oracle.adf.model.datacontrols.device.GeolocationProxy",
               "invokeEmbeddedCallback", userWatchId, position, function () {}, function () {});
          }
          catch (se)
          {
            adf.mf.log.logInfoResource("ADFInfoBundle", adf.mf.log.level.SEVERE,
              "adf.mf.internal.api.watchPosition", "MSG_ERROR_IN_REQUEST", "invokeEmbeddedCallback", se);
          }
        },
        
        function (data) {
          navigator.geolocation.clearWatch(String(watchId));  // if error, need to clear watchId so there is no dangling callbacks
          var message = ((data != null) && (data !== undefined)) ? data.message : "unknown error";
          try
          {
            adf.mf.internal.api.invokeMethod(commId, ADFMF_CONTAINER_UTILITIES_INTERNAL, ASYNC_FAILED_CALLBACK,
               requestId, message, function () {}, function () {});
          }
          catch (se)
          {
            adf.mf.log.logInfoResource("ADFInfoBundle", adf.mf.log.level.SEVERE,
              "adf.mf.internal.api.watchPosition", "MSG_ERROR_IN_REQUEST", ASYNC_FAILED_CALLBACK, se);
          }
        }, 
        geolocationOptions);
    }
    catch(se)
    {
      adf.mf.log.logInfoResource("ADFInfoBundle", adf.mf.log.level.SEVERE,
        "navigator.geolocation.watchPosition", "MSG_EXCEPTION", se);
      adf.mf.internal.api.invokeMethod(commId, ADFMF_CONTAINER_UTILITIES_INTERNAL, ASYNC_FAILED_CALLBACK, requestId, msg, function() {}, function() {});
    }        
  };


  adf.mf.internal.api.clearWatch = function (watchID) {
    if (adf.mf.log.Framework.isLoggable(adf.mf.log.level.FINE)) 
    {
      adf.mf.log.Framework.logp(adf.mf.log.level.SEVERE, "adf.mf.internal.api.clearWatch",
            "CORDOVA_DEBUG", watchID);
    }
    navigator.geolocation.clearWatch(watchID); // no callbacks
  };

  adf.mf.internal.api.createContact = function (commId, requestId, properties) {
    if (adf.mf.log.Framework.isLoggable(adf.mf.log.level.FINE)) 
    {
      adf.mf.log.Framework.logp(adf.mf.log.level.FINE, "adf.mf.internal.api.createContact",
            "CORDOVA_DEBUG", adf.mf.util.stringify(properties));
    }
      
    try
    {      
      // Fix for Bug 16433413: If displayName is passed as null, then Cordova returns "null" for displayName.
      // If empty string is passed in, either valid displayName is returned or null is returned when there is
      // no displayName.
      if (null != properties && null == properties.displayName)
      {
       	properties.displayName = "";
      }
 
      if (adf.mf.log.Framework.isLoggable(adf.mf.log.level.FINER)) 
      {
         adf.mf.log.Framework.logp(adf.mf.log.level.FINER, "adf.mf.internal.api.createContact",
             "CORDOVA_DEBUG_JUST_BEFORE_CREATE_CONTACT_CALL_TO_CORDOVA",
             adf.mf.util.stringify(properties));
      }
 
      var contact = navigator.contacts.create(properties);
  
      contact.save(
      
        function (data) {
          var contact = data || {};
  
          // In cordova-2.2.0.js, createIn method adds "Invalid Object" value for null Birthday
          // so we need to put back null there to serialize in to Java layer properly.
          var bDay = contact.birthday;
          if (isNaN(bDay) || ("undefined" == typeof bDay.getDate))
          {
            contact.birthday = null;
          }
          try
          {
            adf.mf.internal.api.invokeMethod(commId, ADFMF_CONTAINER_UTILITIES_INTERNAL, ASYNC_SUCCESS_CALLBACK,
                 requestId, contact, function () {}, function () {});
          }
          catch (se)
          {
            adf.mf.log.logInfoResource("ADFInfoBundle", adf.mf.log.level.SEVERE,
              "adf.mf.internal.api.createContact", "MSG_ERROR_IN_REQUEST", ASYNC_SUCCESS_CALLBACK, se);
          }
        },
  
        function (data) {
          var errorCode = ((data != null) && (data !== undefined)) ? data.code : ContactError.UNKNOWN_ERROR;
          try
          {
            adf.mf.internal.api.invokeMethod(commId, ADFMF_CONTAINER_UTILITIES_INTERNAL, ASYNC_FAILED_CALLBACK,
                 requestId, errorCode, function () {}, function () {});
          }
          catch (se)
          {
            adf.mf.log.logInfoResource("ADFInfoBundle", adf.mf.log.level.SEVERE,
              "adf.mf.internal.api.createContact", "MSG_ERROR_IN_REQUEST", ASYNC_FAILED_CALLBACK, se);
          }
        });
    }
    catch(se)
    {
      adf.mf.log.logInfoResource("ADFInfoBundle", adf.mf.log.level.SEVERE,
        "navigator.contacts.save", "MSG_EXCEPTION", se);
      adf.mf.internal.api.invokeMethod(commId, ADFMF_CONTAINER_UTILITIES_INTERNAL, ASYNC_FAILED_CALLBACK, requestId, msg, function() {}, function() {});
    }   
  };

  adf.mf.internal.api.findContacts = function (commId, requestId, fields, options) {
    if (adf.mf.log.Framework.isLoggable(adf.mf.log.level.FINE)) 
    {
      adf.mf.log.Framework.logp(adf.mf.log.level.FINE, "adf.mf.internal.api.findContacts", "CORDOVA_DEBUG - fields",
            fields);
      adf.mf.log.Framework.logp(adf.mf.log.level.FINE, "adf.mf.internal.api.findContacts", "CORDOVA_DEBUG - options",
            adf.mf.util.stringify(options));
    }

	try
	{
		navigator.contacts.find(fields, 
			function (data)
			{
				var contacts = data || {};
				if (adf.mf.log.Framework.isLoggable(adf.mf.log.level.FINE)) 
				{
					adf.mf.log.Framework.logp(adf.mf.log.level.FINE, "adf.mf.internal.api.find success",
						"CORDOVA_FIND_CONTACTS_BEFORE_CONVERTING", adf.mf.util.stringify(contacts));
				}

				try
				{
					// cordova-2.2.0.js doesn't invoke createIn() method and thus does not convert birthday from
					// long to String for findContact call and thus the contact(s) returned have birthday as
					// long in stringified way. eg. "505003627119". Whereas saveContact call correctly invokes
					// createIn() method and thus returns valid string. eg. "1986-01-01T22:47:07.119Z".
					// As ADFMF supports this string type or just the long (without stringified long) we need to
					// invoke createIn() method for each contact to convert date to supported format before
					// invoking the success callback method.
					for (var i = 0; i < contacts.length; i++)
					{
						var contact = contacts[i];
						
						// Copied this method body from cordova-2.2.0.js and:
						// 1) Added if condition to safeguard it
						// 2) Removed console.log and added our framework logging.
						var bDay = contact.birthday;
						try
						{
							if (null != bDay && !isNaN(bDay))
							{
								contact.birthday = new Date(parseFloat(bDay));
							}
						}
						catch (exception)
						{
							if (adf.mf.log.Framework.isLoggable(adf.mf.log.level.FINE))
							{
								adf.mf.log.Framework.logp(adf.mf.log.level.FINE, "adf.mf.internal.api.find success",
									"CORDOVA_FIND_CONTACTS_DURING_CONVERT_BDAY", "Exception converting date from long to String");
							}

							adf.mf.log.logInfoResource("ADFInfoBundle", adf.mf.log.level.SEVERE,
								"adf.mf.internal.util.convertContact", "MSG_EXCEPTION", exception);
						}
					}

					if (adf.mf.log.Framework.isLoggable(adf.mf.log.level.FINE))
					{
						adf.mf.log.Framework.logp(adf.mf.log.level.FINE, "adf.mf.internal.api.find success",
							"CORDOVA_FIND_CONTACTS_AFTER_CONVERTING", adf.mf.util.stringify(contacts));
					}

					adf.mf.internal.api.invokeMethod(commId, ADFMF_CONTAINER_UTILITIES_INTERNAL, ASYNC_SUCCESS_CALLBACK,
						requestId, contacts, function () {}, function () {});
				}
				catch (se)
				{
					adf.mf.log.logInfoResource("ADFInfoBundle", adf.mf.log.level.SEVERE,
						"adf.mf.internal.api.findContacts", "MSG_ERROR_IN_REQUEST", ASYNC_SUCCESS_CALLBACK, se);
				}
			},

        function (data) {
          var errorCode = ((data != null) && (data !== undefined)) ? data.code : ContactError.UNKNOWN_ERROR;
          
          try
          {
            adf.mf.internal.api.invokeMethod(commId, ADFMF_CONTAINER_UTILITIES_INTERNAL, ASYNC_FAILED_CALLBACK,
               requestId, errorCode, function () {}, function () {});
          }
          catch (se)
          {
            adf.mf.log.logInfoResource("ADFInfoBundle", adf.mf.log.level.SEVERE,
              "adf.mf.internal.api.findContacts", "MSG_ERROR_IN_REQUEST", ASYNC_FAILED_CALLBACK, se);
          }
        }, options);
    }
    catch(se)
    {
      adf.mf.log.logInfoResource("ADFInfoBundle", adf.mf.log.level.SEVERE,
        "navigator.contacts.find", "MSG_EXCEPTION", se);
      adf.mf.internal.api.invokeMethod(commId, ADFMF_CONTAINER_UTILITIES_INTERNAL, ASYNC_FAILED_CALLBACK, requestId, msg, function() {}, function() {});
    } 
  };

  adf.mf.internal.api.removeContact = function (commId, requestId, properties) {
    if (adf.mf.log.Framework.isLoggable(adf.mf.log.level.FINE)) 
    {
      adf.mf.log.Framework.logp(adf.mf.log.level.FINE, "adf.mf.internal.api.removeContact",
            "CORDOVA_DEBUG",
            adf.mf.util.stringify(properties));
    }

    try
    {
      var contact = navigator.contacts.create(properties);

      contact.remove(
      
        function (data) {
          var contact = data || {};
          try
          {
            adf.mf.internal.api.invokeMethod(commId, ADFMF_CONTAINER_UTILITIES_INTERNAL, ASYNC_SUCCESS_CALLBACK,
                 requestId, contact, function () {}, function () {});
          }
          catch (se)
          {
            adf.mf.log.logInfoResource("ADFInfoBundle", adf.mf.log.level.SEVERE,
              "adf.mf.internal.api.removeContact", "MSG_ERROR_IN_REQUEST", ASYNC_SUCCESS_CALLBACK, se);
          }
        },

        function (data) {
          var errorCode = ((data != null) && (data !== undefined)) ? data.code : ContactError.UNKNOWN_ERROR;
          try
          {
            adf.mf.internal.api.invokeMethod(commId, ADFMF_CONTAINER_UTILITIES_INTERNAL, ASYNC_FAILED_CALLBACK,
               requestId, errorCode, function () {}, function () {});
          }
          catch (se)
          {
            adf.mf.log.logInfoResource("ADFInfoBundle", adf.mf.log.level.SEVERE,
              "adf.mf.internal.api.removeContact", "MSG_ERROR_IN_REQUEST", ASYNC_FAILED_CALLBACK, se);
          }          
        });
    }
    catch(se)
    {
      adf.mf.log.logInfoResource("ADFInfoBundle", adf.mf.log.level.SEVERE,
        "navigator.contacts.remove", "MSG_EXCEPTION", se);
      adf.mf.internal.api.invokeMethod(commId, ADFMF_CONTAINER_UTILITIES_INTERNAL, ASYNC_FAILED_CALLBACK, requestId, msg, function() {}, function() {});
    } 
  };

  adf.mf.internal.api.getPicture = function (commId, requestId, cameraOptions) {
    if (adf.mf.log.Framework.isLoggable(adf.mf.log.level.FINE)) 
    {
      adf.mf.log.Framework.logp(adf.mf.log.level.FINE, "adf.mf.internal.api.getPicture",
            "CORDOVA_DEBUG", adf.mf.util.stringify(cameraOptions));
    }
    
    try
    {
      navigator.camera.getPicture(
        
        function (data) {
          var imageData = data || {};
          if (adf.mf.log.Framework.isLoggable(adf.mf.log.level.FINE)) 
          {
            adf.mf.log.Framework.logp(adf.mf.log.level.FINE, "adf.mf.internal.api.getPicture success",
               "CORDOVA_DEBUG", "");
          }
          try
          {
            adf.mf.internal.api.invokeMethod(commId, ADFMF_CONTAINER_UTILITIES_INTERNAL, ASYNC_SUCCESS_CALLBACK,
               requestId, imageData, function () {}, function () {});
          }
          catch (se)
          {
            adf.mf.log.logInfoResource("ADFInfoBundle", adf.mf.log.level.SEVERE,
              "adf.mf.internal.api.getPicture", "MSG_ERROR_IN_REQUEST", ASYNC_SUCCESS_CALLBACK, se);
          }
        },

        function (data) {
          var message = data || {};
          if (adf.mf.log.Framework.isLoggable(adf.mf.log.level.FINE)) 
          {
            adf.mf.log.Framework.logp(adf.mf.log.level.FINE, "adf.mf.internal.api.getPicture", "CORDOVA_DEBUG", message);
          }
    
         // Return empty string as image data and call success callback instead of calling failure callback
          var imageData = "";
          try
          {
            adf.mf.internal.api.invokeMethod(commId, ADFMF_CONTAINER_UTILITIES_INTERNAL, ASYNC_SUCCESS_CALLBACK,
               requestId, imageData, function () {}, function () {});
          }
          catch (se)
          {
            adf.mf.log.logInfoResource("ADFInfoBundle", adf.mf.log.level.SEVERE,
              "adf.mf.internal.api.getPicture", "MSG_ERROR_IN_REQUEST", ASYNC_FAILED_CALLBACK, se);
          }
        }, cameraOptions);
    }
    catch(se)
    {
      adf.mf.log.logInfoResource("ADFInfoBundle", adf.mf.log.level.SEVERE,
        "navigator.camera.getPicture", "MSG_EXCEPTION", se);
      adf.mf.internal.api.invokeMethod(commId, ADFMF_CONTAINER_UTILITIES_INTERNAL, ASYNC_FAILED_CALLBACK, requestId, msg, function() {}, function() {});
    } 
  };


  adf.mf.internal.api.getDeviceProperties = function(commId, requestId) {
    if (adf.mf.log.Framework.isLoggable(adf.mf.log.level.FINE)) 
    {
      adf.mf.log.Framework.logp(adf.mf.log.level.SEVERE, "adf.mf.internal.api.getDeviceProperties", "CORDOVA_DEBUG", "");
    }
    
    try
    {
      adf.mf.api.getDeviceProperties(
      
        function (data) {
          var deviceProperties = data || {};
          if (adf.mf.log.Framework.isLoggable(adf.mf.log.level.FINE)) 
          {
            adf.mf.log.Framework.logp(adf.mf.log.level.FINE, "adf.mf.internal.api.getDeviceProperties success",
                "CORDOVA_DEBUG", adf.mf.util.stringify(deviceProperties));
          }
          
          // Replace the phonegap version with the value from device.cordova
          deviceProperties.device.phonegap = window.device.cordova;
          
          try
          {
            adf.mf.internal.api.invokeMethod(commId, ADFMF_CONTAINER_UTILITIES_INTERNAL, ASYNC_SUCCESS_CALLBACK,
                                             requestId, deviceProperties, function () {}, function () {});
          }
          catch (se)
          {;
            adf.mf.log.logInfoResource("ADFInfoBundle", adf.mf.log.level.SEVERE,
              "adf.mf.internal.api.getDeviceProperties", "MSG_ERROR_IN_REQUEST", ASYNC_SUCCESS_CALLBACK, se);
          }                              
        },
        
        function (data) {
          var message = data || {};
          if (adf.mf.log.Framework.isLoggable(adf.mf.log.level.FINE)) 
          {
            adf.mf.log.Framework.logp(adf.mf.log.level.FINE, "adf.mf.internal.api.getDeviceProperties failed",
                "CORDOVA_DEBUG", "");
          }
          try
          {
            adf.mf.internal.api.invokeMethod(commId, ADFMF_CONTAINER_UTILITIES_INTERNAL, ASYNC_FAILED_CALLBACK,
                                             requestId, message, function () {}, function () {});
          }
          catch (se)
          {
            adf.mf.log.logInfoResource("ADFInfoBundle", adf.mf.log.level.SEVERE,
              "adf.mf.internal.api.getDeviceProperties", "MSG_ERROR_IN_REQUEST", ASYNC_FAILED_CALLBACK, se);
          }
        });
    }
    catch(se)
    {
      adf.mf.log.logInfoResource("ADFInfoBundle", adf.mf.log.level.SEVERE,
        "adf.mf.api.getDeviceProperties", "MSG_EXCEPTION", se);
      adf.mf.internal.api.invokeMethod(commId, ADFMF_CONTAINER_UTILITIES_INTERNAL, ASYNC_FAILED_CALLBACK, requestId, msg, function() {}, function() {});
    }  
  };
})();

/////////////////////////////////////// end of /Users/buildprocess/HudsonHome/jobs/adfmf-v11-11.1.2.4.1-tip/workspace/Container/JavaScript/ADF/js/ContainerIntegration.js///////////////////////////////////////



/////////////////////////////////////// start of /Users/buildprocess/HudsonHome/jobs/adfmf-v11-11.1.2.4.1-tip/workspace/Container/JavaScript/ADF/js/AdfResource.js///////////////////////////////////////

// moved to base.js
// TODO need to:
// - look for the @-requires messages in all of Bruces code to remove references to "AdfResource"
// - purge this file altogether but be careful to check that Ant doesn't try to reference it

/////////////////////////////////////// end of /Users/buildprocess/HudsonHome/jobs/adfmf-v11-11.1.2.4.1-tip/workspace/Container/JavaScript/ADF/js/AdfResource.js///////////////////////////////////////



/////////////////////////////////////// start of /Users/buildprocess/HudsonHome/jobs/adfmf-v11-11.1.2.4.1-tip/workspace/Container/JavaScript/ADF/js/ValueReference.js///////////////////////////////////////

//@requires ELErrors
//@requires ArrayELResolver
//@requires MapELResolver
//@requires CompositeELResolver
//@requires JavaScriptExpressionFactory
//@requires ValueExpression


var adf                    = window.adf                 || {};
adf.mf                     = adf.mf                     || {};
adf.mf.api                 = adf.mf.api                 || {};
adf.mf.el                  = adf.mf.el                  || {};
adf.mf.locale              = adf.mf.locale              || {};
adf.mf.log                 = adf.mf.log                 || {};
adf.mf.resource            = adf.mf.resource            || {};
adf.mf.util                = adf.mf.util                || {};

adf.mf.internal            = adf.mf.internal            || {};
adf.mf.internal.api        = adf.mf.internal.api        || {};
adf.mf.internal.el         = adf.mf.internal.el         || {};
adf.mf.internal.el.parser  = adf.mf.internal.el.parser  || {};
adf.mf.internal.locale     = adf.mf.internal.locale     || {};
adf.mf.internal.log        = adf.mf.internal.log        || {};
adf.mf.internal.mb         = adf.mf.internal.mb         || {};
adf.mf.internal.perf       = adf.mf.internal.perf       || {};
adf.mf.internal.perf.story = adf.mf.internal.perf.story || {};
adf.mf.internal.resource   = adf.mf.internal.resource   || {};
adf.mf.internal.util       = adf.mf.internal.util       || {};


/**
 * This class encapsulates a base model object and one of its properties.
 * 
 * This object is ideal for resolving a base or property object when doing
 * things like getValue/setValue.
 * 
 * @since 2.2
 */

(function() {
	/**
	 * var exprToVR = new adf.mf.el.ValueReference(context, "myVariable", true);
	 * or
	 * var bpToVR   = new adf.mf.el.ValueReference(context, baseObject, "myVariable", true);
	 */
	/* public interface */
	adf.mf.el.ValueReference = function(/* variable arguments */) {
		this.expression     = null;
		this.context        = null;
		this.baseObject     = null;
		this.baseName       = "";
		this.propertyObject = undefined;
		this.propertyName   = "";

		this.evaluateIndexExpression = function(/* String */ expr) {
			var s = expr.indexOf("[");
			var e = expr.lastIndexOf("]");
			
			if(s < e) {
				var ie = expr.substring(s+1, e);
				var iv = adf.mf.internal.el.parser.evaluate(this.context, "#{" + ie + "}");

				expression = expr.substring(0, s) + "[" + iv + "]" + expr.substring(e+1);
			}
			else {
				expression = expr;
			}
			return expression;
		};


		switch(arguments.length) {
		case 3: /* for the form: ValueReference(<context>, <expression>, <auto create> ) */
			var bns          = 0;       /* base name start index */
			var bne          = 0;       /* base name end index */

			this.context     = arguments[0]; /* context    */
			this.expression  = arguments[1]; /* expression */
			this.autoCreate  = arguments[2]; /* auto create */

			var expr         = this.evaluateIndexExpression(this.expression);

			for(var i = 0; i < expr.length; ++i) {
				switch(expr.charCodeAt(i)) {
				case 93 /* ] */: 
					/* do not break */
					if((i+1) >= expr.length)
					{
						break;
					}
				case 46 /* . */:
				case 91 /* [ */:
					bne = i;   /* this could be the end of the base name */
					if((i+1) < expr.length) {
						this.propertyName = "";    /* only if this is not the last token */
					}

					try
					{
						if(bns == bne) break;

						/* now we know the base object has been resolved */
						this.baseName   = expr.substring(bns, bne);

						this.baseName   = this.baseName.replace(/^\"/, "").replace(/\"$/, "");
						var  tmpBaseObj = this.context.getELResolver().getValue(this.context, this.baseObject, this.baseName);
						this.baseObject = tmpBaseObj;
						bns             = bne + 1;
					}
					catch(e) 
					{   /* do nothing */
						var p = expr.substring(bns, bne);

						if(adf.mf.log.Framework.isLoggable(adf.mf.log.level.FINE)) 
						{
							adf.mf.log.Framework.logp(adf.mf.log.level.FINE, "ValueReference", "ValueReference",
									("Unable to resolve: " + adf.mf.util.stringify(this.baseObject) + " property: " + p));
						}

						if(this.autoCreate)
						{
							if(adf.mf.log.Framework.isLoggable(adf.mf.log.level.FINE)) 
							{
								adf.mf.log.Framework.logp(adf.mf.log.level.FINE, "ValueReference", "ValueReference",
										("auto create is enabled, adding property: " + p));
							}

							bns                = bne + 1;
							this.baseName      = p;

							if(this.baseObject == null)
							{
								adf.mf.el.addVariable(p, {});
								this.baseObject    = p;
							}
							else
							{
								this.baseObject[p] = {};  /* hack our way thru */
								this.baseObject    = this.baseObject[p];
							}
						}
						else
						{
							if(adf.mf.log.Framework.isLoggable(adf.mf.log.level.FINE)) 
							{
								adf.mf.log.Framework.logp(adf.mf.log.level.FINE, "ValueReference", "ValueReference",
										("auto create is _not_ enabled, property: " + p + " will generate a property not found exception"));
							}

							throw new adf.mf.PropertyNotFoundException(p);
						}
					}
					break;

				default: 
					this.propertyName += expr.charAt(i);
				break;
				}/* switch */
			}/* for */
			break;

		case 4: /* for the form: new ValueReference(<context>, <base object>, <property name>, <auto create>) */
			this.context        = arguments[0]; /* context        */
			this.baseObject     = arguments[1]; /* base object    */
			this.propertyName   = arguments[2]; /* property name  */
			this.autoCreate     = arguments[3]; /* auto create    */
			this.propertyObject = this.context.getELResolver().getValue(this.context, this.baseObject, this.propertyName);
			break;

		default: 
			throw new adf.mf.IllegalArgumentException("invalid argument set - " + arguments.length);
		}/* function */

		this.isBaseObjectResolved = function() {
			return (this.baseObject !== null);
		};


		this.isPropertyObjectResolved = function() {
			return (this.propertyObject !== undefined);
		};		
		
		/**
		 * resolve the given name to it's value.
		 */
		/* boolean */
		this.resolve = function() {
			try {
				var token  = "";
				var bni    = 0;    /* base name index */
				var expr   = this.evaluateIndexExpression(this.expression);

				for(var i = 0; i < expr.length; ++i) {
					switch(expr.charCodeAt(i)) {
					case 46 /* . */:
					case 91 /* [ */:
						bni = i - 1;   /* this could be the end of the base name */
					case 93 /* ] */: 
						this.baseObject     = this.propertyObject;   /* what was the property object is now the base object */
						this.propertyObject = this.context.getELResolver().getValue(this.context, this.baseObject, token);

						if((i < expr.length - 1) && (expr.charCodeAt(i) == 93 /* ] */)) {
							/* see if the next character is a . (dot) and eat it so we can evaluate the next guy */
							if(expr.charCodeAt(i+1) == 46 /* . */) {
								i++;
							}
						}
						token = "";
						break;

					default:
						token += expr.charAt(i);
					break;
					}/* switch */
				}/* for */

				if(token.length > 0) {
					/* this is the last property */
					this.baseObject     = this.propertyObject;   /* what was the property object is now the base object */
					this.propertyObject = this.context.getELResolver().getValue(this.context, this.baseObject, token);
				}
			}
			catch (pnf) {
				/* this is a simple hack to catch non-defined .inputValue properties */
				if(((typeof this.baseObject) !== 'object') && (token == "inputValue"))
				{
					this.propertyObject = this.baseObject;
				}
				else
				{
					this.propertyObject = undefined;
				}
			}

			return this.propertyObject;
		};
	};
})();



/////////////////////////////////////// end of /Users/buildprocess/HudsonHome/jobs/adfmf-v11-11.1.2.4.1-tip/workspace/Container/JavaScript/ADF/js/ValueReference.js///////////////////////////////////////



/////////////////////////////////////// start of /Users/buildprocess/HudsonHome/jobs/adfmf-v11-11.1.2.4.1-tip/workspace/Container/JavaScript/ADF/js/AdfLocale.js///////////////////////////////////////

// moved to base.js
// TODO need to:
// - look for the @-requires messages in all of Bruces code to remove references to "AdfLocale"
// - purge this file altogether but be careful to check that Ant doesn't try to reference it

/////////////////////////////////////// end of /Users/buildprocess/HudsonHome/jobs/adfmf-v11-11.1.2.4.1-tip/workspace/Container/JavaScript/ADF/js/AdfLocale.js///////////////////////////////////////



/////////////////////////////////////// start of /Users/buildprocess/HudsonHome/jobs/adfmf-v11-11.1.2.4.1-tip/workspace/Container/JavaScript/ADF/js/Adflog.js///////////////////////////////////////

// moved to base.js
// TODO need to:
// - look for the @-requires messages in all of Bruces code to remove references to "Adflog" (don't think this particular one is required anywhere... maybe just bootstrap)
// - purge this file altogether but be careful to check that Ant doesn't try to reference it

/////////////////////////////////////// end of /Users/buildprocess/HudsonHome/jobs/adfmf-v11-11.1.2.4.1-tip/workspace/Container/JavaScript/ADF/js/Adflog.js///////////////////////////////////////



/////////////////////////////////////// start of /Users/buildprocess/HudsonHome/jobs/adfmf-v11-11.1.2.4.1-tip/workspace/Container/JavaScript/ADF/js/ManagedBeans.js///////////////////////////////////////

/*
* Copyright (c) 2011, Oracle and/or its affiliates. All rights reserved.
*/


var adf                    = window.adf                 || {};
adf.mf                     = adf.mf                     || {};
adf.mf.api                 = adf.mf.api                 || {};
adf.mf.el                  = adf.mf.el                  || {};
adf.mf.locale              = adf.mf.locale              || {};
adf.mf.log                 = adf.mf.log                 || {};
adf.mf.resource            = adf.mf.resource            || {};
adf.mf.util                = adf.mf.util                || {};

adf.mf.internal            = adf.mf.internal            || {};
adf.mf.internal.api        = adf.mf.internal.api        || {};
adf.mf.internal.el         = adf.mf.internal.el         || {};
adf.mf.internal.el.parser  = adf.mf.internal.el.parser  || {};
adf.mf.internal.locale     = adf.mf.internal.locale     || {};
adf.mf.internal.log        = adf.mf.internal.log        || {};
adf.mf.internal.mb         = adf.mf.internal.mb         || {};
adf.mf.internal.perf       = adf.mf.internal.perf       || {};
adf.mf.internal.perf.story = adf.mf.internal.perf.story || {};
adf.mf.internal.resource   = adf.mf.internal.resource   || {};
adf.mf.internal.util       = adf.mf.internal.util       || {};


adf.mf.internal.mb.ManagedBeanDefinition = adf.mf.internal.mb.ManagedBeanDefinition || {
	"APPLICATION": "applicationScope",
    "PAGE_FLOW":   "pageFlowScope",
    "VIEW":        "viewScope"
};

/**
 *  Set a collection of managed bean definitions.  The collection of bean
 *  definitions supplied here _REPLACES_ any existing definitions, it does
 *  not add to the existing set.
 *
 *  @param beanDefs  an array of ManagedBeanDefinition objects.
 */
adf.mf.internal.mb.setBeanDefinitions = function(beanDefs, success, failed)
{
   var defs = (adf.mf.internal.util.is_array(beanDefs))? beanDefs : [beanDefs];  /* ensure defs is an array */
   var scb  = (adf.mf.internal.util.is_array(success))?  success  : [success];

   if(! adf.mf.internal.isJavaAvailable())
   {
	   if(defs.length == 0)
	   {   /* if there are no beans being defined, this command is a NOOP */
		   for(var i = 0; i < scb.length; ++i)
		   {
			   try
			   {
				   scb[i](null, null);
			   }
			   catch(e) { /* ignore */ }
		   }
		   return;  /* do not actually make the java call since it will error out */
	   }
	   else
	   {  /* since there were beans defined, log a message and then let it error out in the invoke */
            adf.mf.log.logInfoResource("ADFInfoBundle", adf.mf.log.level.SEVERE, "adf.mf.internal.mb.setBeanDefinitions", "MSG_ERROR_MNGD_BEANS_NOT_SUPPORTED");                                      
	   }
   }
	   
   adf.mf.api.invokeMethod("oracle.adfmf.framework.api.Model", "setBeanDefinitions", defs, success, failed);
};

/**
 * Managed Bean definition
 * 
 * @param name   - managed bean's name
 * @param type   - managed bean's type
 * @param scope  - managed bean's scope
 * @param props  - managed bean's managed properties
 */
adf.mf.internal.mb.ManagedBeanDefinition = function(name, type, scope, props)
{
   this.beanName     = name;    /* managed bean's name  */
   this.fqnClassname = type;    /* managed bean's type  */
   this.scope        = scope;   /* managed bean's scope */
   this.props        = props;   /* managed bean's props */
   
   /**
    * @return the managed bean's name
    */
   this.getBeanName          = function() { return  this.beanName; };
   
   /**
    * @return the managed bean's fully qualified class name
    */
   this.getBeanClass         = function() { return this.fqnClassname; };
   
   /**
    * @return the managed bean's associated scope 
    */
   this.getScope             = function() { return this.scope;     };
   
   /**
    * @return the associated managed bean's properties
    */
   this.getManagedProperties = function() { return this.props;     };
};


/**
 * Managed property definition used in the managed bean definition
 * that should be set by the controller layer on creation
 * 
 * @param name  - managed bean property
 * @param type  - managed bean property's classname
 * @param value - managed bean property's value
 */
adf.mf.internal.mb.ManagedPropertyDefinition = function(name, type, value)
{
   this.name  = name;    /* managed property's name  */
   this.type  = type;    /* managed property's type  */
   this.value = value;  /* managed property's value */
   
   /**
    * @return the managed property's name
    */
   this.getBeanName          = function() { return  this.beanName; };
   
   /**
    * @return the managed property's fully qualified class name
    */
   this.getType              = function() { return this.type; };
   
   /**
    * @return the managed property's value 
    */
   this.getValue             = function() { return this.value;     };
};


/////////////////////////////////////// end of /Users/buildprocess/HudsonHome/jobs/adfmf-v11-11.1.2.4.1-tip/workspace/Container/JavaScript/ADF/js/ManagedBeans.js///////////////////////////////////////



/////////////////////////////////////// start of /Users/buildprocess/HudsonHome/jobs/adfmf-v11-11.1.2.4.1-tip/workspace/Container/JavaScript/ADF/js/ArrayELResolver.js///////////////////////////////////////

// @requires ELErrors


var adf                    = window.adf                 || {};
adf.mf                     = adf.mf                     || {};
adf.mf.api                 = adf.mf.api                 || {};
adf.mf.el                  = adf.mf.el                  || {};
adf.mf.locale              = adf.mf.locale              || {};
adf.mf.log                 = adf.mf.log                 || {};
adf.mf.resource            = adf.mf.resource            || {};
adf.mf.util                = adf.mf.util                || {};

adf.mf.internal            = adf.mf.internal            || {};
adf.mf.internal.api        = adf.mf.internal.api        || {};
adf.mf.internal.el         = adf.mf.internal.el         || {};
adf.mf.internal.el.parser  = adf.mf.internal.el.parser  || {};
adf.mf.internal.locale     = adf.mf.internal.locale     || {};
adf.mf.internal.log        = adf.mf.internal.log        || {};
adf.mf.internal.mb         = adf.mf.internal.mb         || {};
adf.mf.internal.perf       = adf.mf.internal.perf       || {};
adf.mf.internal.perf.story = adf.mf.internal.perf.story || {};
adf.mf.internal.resource   = adf.mf.internal.resource   || {};
adf.mf.internal.util       = adf.mf.internal.util       || {};


/**
 * Defines property resolution behavior on arrays. This resolver handles base objects that are Java
 * language arrays. It accepts any object as a property and coerces that object into an integer
 * index into the array. The resulting value is the value in the array at that index. This resolver
 * can be constructed in read-only mode, which means that isReadOnly will always return true and
 * {@link #setValue(ELContext, object, object, object)} will always throw
 * PropertyNotWritableException. ELResolvers are combined together using {@link CompositeELResolver}
 * s, to define rich semantics for evaluating an expression. See the javadocs for {@link ELResolver}
 * for details.
 */
adf.mf.internal.el.ArrayELResolver = function(/* boolean */ readOnly) { /* implements ELResolver */
	this.readOnly = (readOnly === undefined)? false : readOnly;

	/**
	 * If the base object is a array, returns the most general type that this resolver
	 * accepts for the property argument. Otherwise, returns null. Assuming the base is an array,
	 * this method will always return integer type. This is because arrays accept integers for
	 * their index.
	 * 
	 * @param context
	 *            The context of this evaluation.
	 * @param base
	 *            The array to analyze. Only bases that are a Java language array are handled by
	 *            this resolver.
	 * @return null if base is not a Java language array; otherwise Integer.class.
	 */
	/* Type */
	this.getCommonPropertyType = function(/* ELContext */ context, /* object */ base) {
		return this.isResolvable(base) ? (typeof 1) : null;
	};
	

	/**
	 * Always returns null, since there is no reason to iterate through set set of all integers. The
	 * getCommonPropertyType(ELContext, object) method returns sufficient information about what
	 * properties this resolver accepts.
	 * 
	 * @param context
	 *            The context of this evaluation.
	 * @param base
	 *            The array to analyze. Only bases that are a Java language array are handled by
	 *            this resolver.
	 * @return null.
	 */
	/* Iterator<FeatureDescriptor> */
	this.getFeatureDescriptors = function(/* ELContext */ context, /* object */ base) {
		return null;
	};
	

	/**
	 * If the base object is an array, returns the most general acceptable type for a value in this
	 * array. If the base is a array, the propertyResolved property of the ELContext object must be
	 * set to true by this resolver, before returning. If this property is not true after this
	 * method is called, the caller should ignore the return value. Assuming the base is an array,
	 * this method will always return base.getClass().getComponentType(), which is the most general
	 * type of component that can be stored at any given index in the array.
	 * 
	 * @param context
	 *            The context of this evaluation.
	 * @param base
	 *            The array to analyze. Only bases that are a Java language array are handled by
	 *            this resolver.
	 * @param property
	 *            The index of the element in the array to return the acceptable type for. Will be
	 *            coerced into an integer, but otherwise ignored by this resolver.
	 * @return If the propertyResolved property of ELContext was set to true, then the most general
	 *         acceptable type; otherwise undefined.
	 * @throws PropertyNotFoundException
	 *             if the given index is out of bounds for this array.
	 * @throws NullPointerException
	 *             if context is null
	 * @throws ELException
	 *             if an exception was thrown while performing the property or variable resolution.
	 *             The thrown exception must be included as the cause property of this exception, if
	 *             available.
	 */
	/* Type */
	this.getType = function(/* ELContext */ context, /* object */ base, /* object */ property) {
		if (context === null) {
			throw new adf.mf.NullPointerException("context is null");
		}
		
		var result = null;
		if (this.isResolvable(base)) {
			context.setPropertyResolved(true);
			result = (typeof base[property]) | 'object';
		}
		return result;
	};
	

	/**
	 * If the base object is a Java language array, returns the value at the given index. The index
	 * is specified by the property argument, and coerced into an integer. If the coercion could not
	 * be performed, an IllegalArgumentException is thrown. If the index is out of bounds, null is
	 * returned. If the base is a Java language array, the propertyResolved property of the
	 * ELContext object must be set to true by this resolver, before returning. If this property is
	 * not true after this method is called, the caller should ignore the return value.
	 * 
	 * @param context
	 *            The context of this evaluation.
	 * @param base
	 *            The array to analyze. Only bases that are a Java language array are handled by
	 *            this resolver.
	 * @param property
	 *            The index of the element in the array to return the acceptable type for. Will be
	 *            coerced into an integer, but otherwise ignored by this resolver.
	 * @return If the propertyResolved property of ELContext was set to true, then the value at the
	 *         given index or null if the index was out of bounds. Otherwise, undefined.
	 * @throws PropertyNotFoundException
	 *             if the given index is out of bounds for this array.
	 * @throws NullPointerException
	 *             if context is null
	 * @throws ELException
	 *             if an exception was thrown while performing the property or variable resolution.
	 *             The thrown exception must be included as the cause property of this exception, if
	 *             available.
	 */
	/* object */ 
	this.getValue = function(/* ELContext */ context, /* object */ base, /* object */ property) {
		if (context === null) {
			throw new adf.mf.NullPointerException("context is null");
		}
		
		var result = null;
		
		if (this.isResolvable(base)) {
			// adf.mf.internal.perf.trace("adf.mf.internal.el.ArrayELResolver", "getValue: " + property);	
			result = base[property];
			context.setPropertyResolved(result !== undefined);
		}
		return result;
	};
	

	/**
	 * If the base object is a Java language array, returns whether a call to
	 * {@link #setValue(ELContext, object, object, object)} will always fail. If the base is a Java
	 * language array, the propertyResolved property of the ELContext object must be set to true by
	 * this resolver, before returning. If this property is not true after this method is called,
	 * the caller should ignore the return value. If this resolver was constructed in read-only
	 * mode, this method will always return true. Otherwise, it returns false.
	 * 
	 * @param context
	 *            The context of this evaluation.
	 * @param base
	 *            The array to analyze. Only bases that are a Java language array are handled by
	 *            this resolver.
	 * @param property
	 *            The index of the element in the array to return the acceptable type for. Will be
	 *            coerced into an integer, but otherwise ignored by this resolver.
	 * @return If the propertyResolved property of ELContext was set to true, then true if calling
	 *         the setValue method will always fail or false if it is possible that such a call may
	 *         succeed; otherwise undefined.
	 * @throws PropertyNotFoundException
	 *             if the given index is out of bounds for this array.
	 * @throws NullPointerException
	 *             if context is null
	 * @throws ELException
	 *             if an exception was thrown while performing the property or variable resolution.
	 *             The thrown exception must be included as the cause property of this exception, if
	 *             available.
	 */
	/* boolean */
	this.isReadOnly = function(/* ELContext */ context, /* object */ base, /* object */ property) {
		if (context === null) {
			throw new adf.mf.NullPointerException("context is null");
		}
		
		if (this.isResolvable(base)) {
			context.setPropertyResolved(true);
		}
		
		return this.readOnly;
	};
	

	/**
	 * If the base object is a Java language array, attempts to set the value at the given index
	 * with the given value. The index is specified by the property argument, and coerced into an
	 * integer. If the coercion could not be performed, an IllegalArgumentException is thrown. If
	 * the index is out of bounds, a PropertyNotFoundException is thrown. If the base is a Java
	 * language array, the propertyResolved property of the ELContext object must be set to true by
	 * this resolver, before returning. If this property is not true after this method is called,
	 * the caller can safely assume no value was set. If this resolver was constructed in read-only
	 * mode, this method will always throw PropertyNotWritableException.
	 * 
	 * @param context
	 *            The context of this evaluation.
	 * @param base
	 *            The array to analyze. Only bases that are a Java language array are handled by
	 *            this resolver.
	 * @param property
	 *            The index of the element in the array to return the acceptable type for. Will be
	 *            coerced into an integer, but otherwise ignored by this resolver.
	 * @param value
	 *            The value to be set at the given index.
	 * @throws PropertyNotFoundException
	 *             if the given index is out of bounds for this array.
	 * @throws ClassCastException
	 *             if the class of the specified element prevents it from being added to this array.
	 * @throws NullPointerException
	 *             if context is null
	 * @throws IllegalArgumentException
	 *             if the property could not be coerced into an integer, or if some aspect of the
	 *             specified element prevents it from being added to this array.
	 * @throws PropertyNotWritableException
	 *             if this resolver was constructed in read-only mode.
	 * @throws ELException
	 *             if an exception was thrown while performing the property or variable resolution.
	 *             The thrown exception must be included as the cause property of this exception, if
	 *             available.
	 */
	/* void */
	this.setValue = function(/* ELContext */ context, /* object */ base, /* object */ property, /* object */ value) {
		if (context === null) {
			throw new adf.mf.NullPointerException("context is null");
		}
		
		if (this.isResolvable(base)) {
			if (this.readOnly) {
				throw new adf.mf.PropertyNotWritableException("resolver is read-only");
			}
			base[property] = value;
			context.setPropertyResolved(true);
		}
	};
	

	/**
	 * Test whether the given base should be resolved by this ELResolver.
	 * 
	 * @param base
	 *            The bean to analyze.
	 * @param property
	 *            The name of the property to analyze. Will be coerced to a String.
	 * @return base != null && base.isArray()
	 */
	/* boolean */ 
	this.isResolvable = function(/* object */ base) {
		return ((base !== undefined) && (base !== null) && (base instanceof Array));
	};
};


/////////////////////////////////////// end of /Users/buildprocess/HudsonHome/jobs/adfmf-v11-11.1.2.4.1-tip/workspace/Container/JavaScript/ADF/js/ArrayELResolver.js///////////////////////////////////////



/////////////////////////////////////// start of /Users/buildprocess/HudsonHome/jobs/adfmf-v11-11.1.2.4.1-tip/workspace/Container/JavaScript/ADF/js/AdfPerfTiming.js///////////////////////////////////////


// @requires Adflog
// @requires ELErrors


var adf                    = window.adf                 || {};
adf.mf                     = adf.mf                     || {};
adf.mf.api                 = adf.mf.api                 || {};
adf.mf.el                  = adf.mf.el                  || {};
adf.mf.locale              = adf.mf.locale              || {};
adf.mf.log                 = adf.mf.log                 || {};
adf.mf.resource            = adf.mf.resource            || {};
adf.mf.util                = adf.mf.util                || {};

adf.mf.internal            = adf.mf.internal            || {};
adf.mf.internal.api        = adf.mf.internal.api        || {};
adf.mf.internal.el         = adf.mf.internal.el         || {};
adf.mf.internal.el.parser  = adf.mf.internal.el.parser  || {};
adf.mf.internal.locale     = adf.mf.internal.locale     || {};
adf.mf.internal.log        = adf.mf.internal.log        || {};
adf.mf.internal.mb         = adf.mf.internal.mb         || {};
adf.mf.internal.perf       = adf.mf.internal.perf       || {};
adf.mf.internal.perf.story = adf.mf.internal.perf.story || {};
adf.mf.internal.resource   = adf.mf.internal.resource   || {};
adf.mf.internal.util       = adf.mf.internal.util       || {};

/**
 * adf.mf.internal.perf consists of a set of javascript functions and logger definition
 * to instrument the adf.mf javascript sub-systems.  In addition to just being able to
 * obtain performance information, it also provides a fairly nice way to introspect what
 * is being done (especially in the AMX layer).
 * 
 * HOW-TO USE THIS:
 * 1. Declare the performance logger
 * 
 *    #configure the performance logger to only use the adfmf ConsoleHandler
 *    oracle.adfmf.performance.level=FINER
 *    oracle.adfmf.performance.useParentHandlers=false
 *    oracle.adfmf.performance.handlers=oracle.adfmf.util.logging.ConsoleHandler
 *    
 * 2. The performance log levels will yield different information:
 *    FINE:   basic timing information
 *    FINER:  reduced output that makes it easy to read from the debugger
 *    FINEST: added DEBUG TRACE messages for illustrating code and data flow
 *            (this will not yield meaningful performance information, but will
 *             provide helpful code paths so you can determine particular paths
 *             so specific targeted tests can be built). 
 *             
 * 3. Developers can add either start/stop, checkpoint, or trace style entries
 *    added to the performance log (based on the log level defined).  The following
 *    are guidelines to how to select which type of entries to use.
 *    
 *    start/stop - should be used for anything we want to instrument and monitor
 *                 from build to build.  Examples of these are:
 *                 - how long it takes to make a call over the channel
 *                 - how long it takes to evaluate an EL expression
 *                 - how long it takes to render a list view
 *                 - how long it takes to render a screen
 *                 - ...
 *    checkpoint - should be used when we not looking at determining it performance
 *                 but are want to log a known point in the algorithm.  We can then
 *                 use this information to determine if the algorithm is behaving 
 *                 consistent from run to run.  Examples of these are:
 *                 - denote when we perform standard CRUD operations to local values
 *                   This is important and can tell us where we are in the algorithm.
 *                 - denote a key point in the algorithm.
 *                 
 *    trace      - should be used to denote data flow so we can determine a particular
 *                 code path.  This is critical when we determine a problem and need
 *                 to determine what the particular code path is, so we can then build
 *                 targeted tests to ensure the given use case is being replicated with
 *                 the targeted tests.  
 */

//Wrapper for localizing vars
(function() {
	// create a performance logger that can be used in the javascript
	adf.mf.log.Performance = adf.mf.log.Performance || new adf.mf.log.logger('oracle.adfmf.performance');
    
	/*
	 * Uncomment the following line, in order to obtain performance numbers for start up.
	 */
	adf.mf.log.Performance.init(adf.mf.log.level.FINE, '[%LEVEL% - %LOGGER% - %CLASS% - %METHOD%] %MESSAGE%');
    
	var _logOffset         = undefined;
	var _recordStartTime   = undefined;
	var _logRecordID       = 1;
	var _currentSequenceID = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
	var _displaySequenceID = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
	var _depth             = 0;
	var _maxDepth          = 30;
    var _lastTimeOffset    = 0;
	var _appStartTime      = 0;  /* set after adf.mf.internal.perf.getQueryParameter is defined */
	var _viewStartTime     = 0;  /* set after adf.mf.internal.perf.getQueryParameter is defined */
    var _loadTime          = 0;  /* set after adf.mf.internal.perf.getQueryParameter is defined */
    var _currentStory      = []; /* user story names - supports nested stories                  */
    
	// ============================================================================================ 
    
    var DELTA_FIELD    = "delta";    // this entries time delta
	var DEPTH_FIELD    = "depth";    // the record's nesting level or trace depth
	var KEY_FIELD      = "key";      // the record key or category
	var MESSAGE_FIELD  = "message";  // the message the log record was logged with
	var SEQUENCE_FIELD = "sequence"; // the sequence for the log record
	var TIMING_FIELD   = "timing";   // relative time from the beginning of the record
	var TYPE_FIELD     = "mtype";    // message type the log record was logged with
	var WHEN_FIELD     = "when";     // timestamp at which the logging occurred
	
	
	adf.mf.internal.perf.getCurrentSequenceId = function()
	{
		return "ID: " + _currentSequenceID;
	}
	
	adf.mf.internal.perf.getQueryParameter = function(/* string */ name)
	{
		try
		{
			var fqp   = adf.mf.api.getQueryString();
			var fqp   = fqp.toLowerCase();
			var value = adf.mf.api.getQueryStringParamValue(fqp, name.toLowerCase());
			return value;
		}
		catch(e)
		{
			adf.mf.log.Framework.logp(adf.mf.log.level.WARNING, "adf.mf.internal.perf", "getQueryParameter",
		               ("query parameter '" + name + "' was not found."));
		}
		return undefined;
	};
	
	/* save off the application and feature start up times so we can show time offsets from them later */
	var _appStartTime      = Math.floor(adf.mf.internal.perf.getQueryParameter("appStartTime")     || 0);
	var _viewStartTime     = Math.floor(adf.mf.internal.perf.getQueryParameter("webviewStartTime") || 0);
    var _loadTime          = (new Date()).getTime();

    
	/* void */ 
	adf.mf.internal.perf.adjustScopeLevel = function(offset)
	{
		if((_depth + offset) >= _currentSequenceID.length)
		{
			throw new adf.mf.IllegalArgumentException("performance logging too deep to record (depth=" + _depth + ").");
		}
		
		if((offset < 0) && (_depth+1 < _currentSequenceID.length)) {
			_currentSequenceID[_depth+1] = 0;
		}
        
		_depth += offset;
	};
    
	/* String */ 
	adf.mf.internal.perf.getNextSequenceId = function(mtype)
	{
		var  id     = undefined;
		var  offset = ((mtype == "STOP") || (mtype == "STOP.STORY"))? 0 : 1;
		
		_currentSequenceID[_depth - 1] = _currentSequenceID[_depth - 1] + offset;
		
		id = _currentSequenceID.slice(0, _depth);
		id = id.concat(_displaySequenceID);
        
		return id.slice(0, _maxDepth).join(".");
	};
	
	/* void */ 
	adf.mf.internal.perf.enterBlock = function()
	{
		adf.mf.internal.perf.adjustScopeLevel(1);
	};
	
	/* void */ 
	adf.mf.internal.perf.leaveBlock = function()
	{
		adf.mf.internal.perf.adjustScopeLevel(-1);
	};
    
	/**
	 * Structure for perf logging, representing log records
	 */
	adf.mf.internal.perf.AdfPerfLogRecord = function(messageType, message, key, when, timing)
	{  
		this.sequence        = adf.mf.internal.perf.getNextSequenceId(messageType);
		this.mtype           = messageType;
		this.depth           = _depth;
		
		// For now, only text and timestamp.
		// TODO: Look into finer grain timing, similar to log levels. This might be an overkill though.
        
		// Make sure we store actual Date object, not just a number passed in.
		if (!when) this.when = new Date();
		else       this.when = new Date(when);
        
		this.message = message;
        
		// Timing is relative to the start of the record, so if we have it, log it
		// Note that timing can be 0 (zero), in which case it will not be logged
		if (timing)
        {
            this.timing     = timing;
            this.delta      = timing - _lastTimeOffset;
            _lastTimeOffset = timing;
        }
		else  
        {
            this.timing     = null;
            this.delta      = null;
        }
        
        
		// Key string is used to relate records in post processing
		if (key)        this.key = key;
		else            this.key = null;
	};
    
    
	/**
	 * A logger subclass which logs messages to a console window.
	 */
	adf.mf.internal.perf.AdfPerfTimingConsoleLogger = function()
	{
		this.Init();		
	};
	
	adf.mf.internal.perf.AdfPerfTimingConsoleLogger.prototype.Init = function()
	{
		this._loggedMessages = new Array();  // the list of logged messages
        this._lastTimeOffset = 0;
	};
    
	/**
	 * Stores the record into the internal buffer
	 */
	adf.mf.internal.perf.AdfPerfTimingConsoleLogger.prototype.storeLogRecord = function( logRecord )
	{
		if ( logRecord === undefined )
        throw new adf.mf.IllegalArgumentException("logRecord is invalid");
        
		// In case message buffer is empty, remove the timing data, since this is the first entry
		if (this._loggedMessages.length < 1)
        logRecord.timing = null;
        
		this._loggedMessages.push(logRecord);
	};
    
	/**
	 * Get the log records
	 */
	adf.mf.internal.perf.AdfPerfTimingConsoleLogger.prototype.getLogRecords = function( logRecord )
	{
		return this._loggedMessages;
	};
    
	/**
	 * Clears the contents of the buffer without closing it
	 */
	adf.mf.internal.perf.AdfPerfTimingConsoleLogger.prototype.Clear = function()
	{
		var   now            = (new Date()).getTime();
		
		// TODO: For some reason, not deleting the message array explicitly
		// caused perceived mem leak. GC faulty in simulator/Safari?
		delete this._loggedMessages;
		
		this._loggedMessages = null;
		this._loggedMessages = new Array();
        this._lastTimeOffset = 0;
        
        this._appDelta       = now - _appStartTime;
        this._featureDelta   = now - _viewStartTime;
	};
    
	/**
	 * Formats the when field of the LogRecord
	 */
	adf.mf.internal.perf.AdfPerfTimingConsoleLogger.prototype.FormatWhen = function( when )
	{
		if (when)
		{
			// User friendly time is first, for general orientation
			var timeString = when.toTimeString();
            
			// trim off the GMT end of the string
			var lastOpenParen = timeString.indexOf(' ');
			if (lastOpenParen != -1)
			{
				timeString = timeString.substring(0, lastOpenParen);
			}
            
			// Append the timestamp, for absolute timing with ms resolution
			timeString += ", " + when.getTime();
            
			return timeString;
		}
		else
		{
			// Instead of exception, return null, so we can hopefully go on
			return null;
		}
	};
    
	/**
	 * Formats the message field of the AdfLogRecord. Tries to pretty it up some
	 * and more replacements can be added as one sees appropriate.
	 */
	adf.mf.internal.perf.AdfPerfTimingConsoleLogger.prototype.FormatMessage = function(message)
	{
		message = message.replace(/</g, "&lt;");  // replace "<" with entity
		message = message.replace(/>/g, "&gt;");  // replace ">" with entity
		message = message.replace(/\n/g, "<br>"); // replace "/n" with <br>
        
		return message;
	};
    
	/**
	 * Formats the log record in the following format:
	 *   <category>, <sequence id>, <timing>, <delta>, <depth>, <type>, <message>
	 */
	adf.mf.internal.perf.AdfPerfTimingConsoleLogger.prototype.FormatLogRecord = function(logRecord)
	{  
		// Make things pretty. Since this is console, there is no XML formatting
		var formatted = "";
        var field     = "";
        
        /****** @TODO kilgore remove this check after the indentation is figured out. **********/
		if (! adf.mf.log.Performance.isLoggable(adf.mf.log.level.FINER))
		{
			formatted += this.FormatWhen(logRecord[WHEN_FIELD]);
			formatted += ", ";
	        
			field      = (logRecord[KEY_FIELD] || "NoCategory").substring(0, 10) + ", ";
	        formatted += formatLine(field, 0, 12);
		}

		field      = logRecord[SEQUENCE_FIELD] + ", ";
        formatted += formatLine(field, 0, (_maxDepth * 3));
		
        field      = ("" + logRecord[TIMING_FIELD]) + ", "; 
        formatted += formatLine(field, 0, 6);

        field      = ("" + logRecord[DELTA_FIELD]).substring(0, 8) + ", ";
        formatted += formatLine(field, 0, 6);
        
        field      = (("" + logRecord[DEPTH_FIELD]) || "???").substring(0, 3) + ", ";
        formatted += formatLine(field, 0, 6);
        
        field      = ((logRecord[TYPE_FIELD] || "UNKNOWN") + ",         ").substring(0, 12);
        formatted += formatLine(field, 0, 10) + " MSG, ";
        
        field      = logRecord[MESSAGE_FIELD]; 
		formatted += formatLine(field, logRecord[DEPTH_FIELD], 32);

		return formatted;
	};
    
    formatLine = function(line, indent, pad)
    {
        var str     = line   || "undefined";
        var pLength = indent || 0;
        var sLength = (pad   || 0) - str.length;
        
		for(var p = 0; p < pLength; ++p)  str = " " + str;
		for(var s = 0; s < sLength; ++s)  str = str + " ";
        return str;
    };
	
    
	/**
	 * Close the log record and write it out to console logger
	 */
	adf.mf.internal.perf.AdfPerfTimingConsoleLogger.prototype.closeRecord = function()
	{
		// Placeholder for final log entry
		var logString = "\n";
		var start     = undefined;
        var end       = undefined;
        
		// Get log records one by one and process them, if they exist
		if (this._loggedMessages.length)
		{ 
			var logCount = this._loggedMessages.length; 

			/* fix up the start/stop story entries */
			for (var i = 0; i < logCount; i++)
			{   // check to see if we need to fix up the start/stop for the story
				if("START.STORY" == this._loggedMessages[i][TYPE_FIELD])
				{
					/* find the first non-start and make it your timestamp */
					for(var j = i+1; j < logCount; j++)
					{
						if("START.STORY" != this._loggedMessages[j][TYPE_FIELD])
						{
							this._loggedMessages[i][WHEN_FIELD] = this._loggedMessages[j][WHEN_FIELD];
							break;
						}
					}
				}
				
				if("STOP.STORY" == this._loggedMessages[i][TYPE_FIELD])
				{
					/* find the first non-stop and make it your timestamp */
					for(var j = i-1; j > 0; j--)
					{
						if("STOP.STORY" != this._loggedMessages[j][TYPE_FIELD])
						{
							this._loggedMessages[i][WHEN_FIELD] = this._loggedMessages[j][WHEN_FIELD];
							break;
						}
					}
				}
			}
			
			for (var i = 0; i < logCount; i++)
			{
                var when = this._loggedMessages[i][WHEN_FIELD];
                
				this._loggedMessages[i] = "LR " + _logRecordID + ", " + this.FormatLogRecord(this._loggedMessages[i]);
                
                start = ((start !== undefined) && (start < when))? start : when;
                end   = ((end   !== undefined) && (end   > when))? end   : when;
			}
			logString  = " [time offsets app: " + this._appDelta + " feature: " + this._featureDelta + "] ";
			logString += " took " + (end - start) + " ms.\n";

			logString += "<LR>, <time>, <timestamp>, <category>, <sequence id>, <timing>, <delta>, <depth>, <type>, <message>\n";
            logString += this._loggedMessages.join("\n");
            
			// Send log off to console, for now, info level is used
			adf.mf.log.Performance.logp(adf.mf.log.level.FINE, "AdfPerfTimingConsoleLogger", "perfTimings", logString);
            
			// Set up for next log record
			_logRecordID++;
            _currentSequenceID[_depth] = 0;
		}
        
		this.Clear();
	};
    
	var PROFILER_LOGGER = new adf.mf.internal.perf.AdfPerfTimingConsoleLogger();
    
    
	// ============================================================================================ 
	/**
	 * @return {int} the current maximum depth for performance logging
	 */
    /* int */
	adf.mf.internal.perf.getMaxDepth = function()
	{
		return _maxDepth;
	};
	
	/**
	 * Set the current maximum depth for performance logging
	 * 
	 * @param {int} newDepth - the new value for max depth
	 */
	/* void */
	adf.mf.internal.perf.setMaxDepth = function(/* int */ newDepth)
	{
		_maxDepth = newDepth;
	};
	
    /**
     * @return {int} current depth
     */    
	/* int */
	adf.mf.internal.perf.getCurrentDepth = function()
	{
		return _depth;
	};
    
	/**
	 * For performance timings. Times the event.
	 * @param {Boolean} closeRecord should the log record be closed or not
	 * @param {Boolean} closeBefore should the log record be closed before or after logging
	 *                                 (has no effect if closeRecord is false)
	 * @param {Boolean} timing should it be logged when only timing is on
	 * @param {String} str1 first string to be logged
	 * @param {String} str2 second string to be logged
	 * @param {String} keyString category of log message, could be used as a key to
	 *                                uniquely define a message or used for co-relation
	 *
	 * If you are looking to find out how long something takes, place two invocations
	 * of perfTiming around your code, like so:
	 *
	 *   adf.mf.internal.perf.perfTimings = function(false, false, true, "Some message 1");
	 *
	 *   // Your code goes here
	 *
	 *   adf.mf.internal.perf.perfTimings = function(false, false, true, "Some message 2", "Some message 3");
	 *
	 * It is recommended that string messages be constant, or as simple as possible, in order to
	 * avoid costly calculations.
	 *
	 */
	adf.mf.internal.perf.perfTimings = function(closeRecord, closeBefore, timing, str1, str2, keyString)
	{
		if ((adf.mf.log.Performance.isLoggable(adf.mf.log.level.FINE)) || 
        (adf.mf.log.Performance.isLoggable(adf.mf.log.level.FINER) && timing))
		{
			adf.mf.internal.perf.enterBlock();
			adf.mf.internal.perf.log(0, closeRecord, closeBefore, timing, str1, str2, keyString);
			adf.mf.internal.perf.leaveBlock();
		}
	};
	
	adf.mf.internal.perf.trace = function(str1, str2, keyString)
	{
		if (adf.mf.log.Performance.isLoggable(adf.mf.log.level.FINEST))
		{
			adf.mf.internal.perf.enterBlock();
			adf.mf.internal.perf.log("TRACE", false, false, false, str1, str2, keyString);
			adf.mf.internal.perf.leaveBlock();
		}
	};
	
	adf.mf.internal.perf.snapshot = function(str1, str2, keyString)
	{
		if (adf.mf.log.Performance.isLoggable(adf.mf.log.level.FINER))
		{
			adf.mf.internal.perf.enterBlock();
			adf.mf.internal.perf.log("CHECK", false, false, false, str1, str2, keyString);
			adf.mf.internal.perf.leaveBlock();
		}
	};
	
	adf.mf.internal.perf.start = function(str1, str2, keyString)
	{
		if ((adf.mf.log.Performance.isLoggable(adf.mf.log.level.FINE)) ||
        (adf.mf.log.Performance.isLoggable(adf.mf.log.level.FINER) && timing))
		{
			adf.mf.internal.perf.enterBlock();
			adf.mf.internal.perf.log("START", false, false, true, str1, str2, keyString);
            // console.log("DEBUG-NESTING: start - " + _depth + " ::: " + str1 + " " + str2 + " " + keyString);
		}
	};
    
	adf.mf.internal.perf.stop = function(str1, str2, keyString)
	{
		if ((adf.mf.log.Performance.isLoggable(adf.mf.log.level.FINE)) ||
        (adf.mf.log.Performance.isLoggable(adf.mf.log.level.FINER) && timing))
		{
            // console.log("DEBUG-NESTING: stop  - " + _depth + " ::: " + str1 + " " + str2 + " " + keyString);
			adf.mf.internal.perf.log("STOP", (_depth == 1), false, true, str1, str2, keyString);
			adf.mf.internal.perf.leaveBlock();
		}
	};
	
	/**
	 * For performance timings. Times the event.
	 * @param {String} recordType (snapshot, start, end)
	 * @param {Boolean} closeRecord should the log record be closed or not
	 * @param {Boolean} closeBefore should the log record be closed before or after logging
	 *                                 (has no effect if closeRecord is false)
	 * @param {Boolean} timing should it be logged when only timing is on
	 * @param {String} str1 first string to be logged
	 * @param {String} str2 second string to be logged
	 * @param {String} keyString category of log message, could be used as a key to
	 *                                uniquely define a message or used for co-relation
	 *
	 * If you are looking to find out how long something takes, place two invocations
	 * of perfTiming around your code, like so:
	 *
	 *   adf.mf.internal.perf.perfTimings = function(false, false, true, "Some message 1");
	 *
	 *   // Your code goes here
	 *
	 *   adf.mf.internal.perf.perfTimings = function(false, false, true, "Some message 2", "Some message 3");
	 *
	 * It is recommended that string messages be constant, or as simple as possible, in order to
	 * avoid costly calculations.
	 *
	 */
	adf.mf.internal.perf.log = function(mtype, closeRecord, closeBefore, timing, str1, str2, keyString)
    {  
		 if(_depth > _maxDepth - 1)
		 {
			 var details = "record: (key=" + keyString + ", str1=" + str1 + ", str2=" + str2 + ")";
			 adf.mf.log.Performance.logp(adf.mf.log.level.SEVERE, "AdfPerfTimingConsoleLogger", "--ERROR--",
										 "Attempting to go over the top in the nesting level for " + details);
			 return;
		 }
		 
		 if(_depth < 0)
		 {
			 var details = "record: (key=" + keyString + ", str1=" + str1 + ", str2=" + str2 + ")";
			 adf.mf.log.Performance.logp(adf.mf.log.level.SEVERE, "AdfPerfTimingConsoleLogger", "--ERROR--",
										 "Attempting to go negative in the nesting level for " + details);
			 _depth = 0;
		 }
			
		/**
		 * Since we are using the 'oracle.adfmf.performance' log levels to control the
		 * granularity of what we capture, we need to condition off what is loggable or not.
		 * 
		 * FINE  - implies profiling is enabled
		 * FINER - implies profiling with timings is enabled
		 */
		if ((adf.mf.log.Performance.isLoggable(adf.mf.log.level.FINE)) || 
        (adf.mf.log.Performance.isLoggable(adf.mf.log.level.FINER) && timing))
		{
            var logger    = PROFILER_LOGGER;
			var startTime = undefined;
			var accTime   = undefined;
			var msg       = (str1 || "") + " " + (str2 || "");
            
			if (((typeof closeRecord) != "boolean") || ((typeof closeBefore) != "boolean") || ((typeof timing) != "boolean"))
			{
				throw new adf.mf.IllegalArgumentException("closeRecord=" + closeRecord + ", closeBefore=" + closeBefore + ", timing=" + timing );
			}
            
			startTime = (new Date()).getTime();
            
			// Record start time will be undefined for new records
			if (_recordStartTime === undefined)
            _recordStartTime = startTime;
            
			// Sub the offset from the real time
			// NOTE: This will really come into play if we ship logs to java world
			_logOffset  = _logOffset || 0;
			accTime     = startTime - _logOffset;
            
			if(closeRecord)
			{
				// TODO: For now, we are only writing to console logger
                
				// In case we have a file logger, we need to account for the log closing time, 
				// which includes shipping it to java side and writting it out to file
				// Calculate the closing time and add it as a offset for the future timings
				// TODO: Move this whole calculation into the logger itself, rather than doing it here
				if (closeBefore)
				{
					// First close existing log record, then start a new one
					logger.closeRecord();
					logger.storeLogRecord( new adf.mf.internal.perf.AdfPerfLogRecord(mtype, msg, keyString, accTime) );
				}
				else
				{
					logger.storeLogRecord( new adf.mf.internal.perf.AdfPerfLogRecord(mtype, msg, keyString, accTime, (accTime - _recordStartTime)) );    
					logger.closeRecord();
				} // end of else
                
				// Reset record start time for the new log record when it comes     
				_recordStartTime = undefined;
			}
			else
			{
				// No closing the record, so log timing from the begining of the record as well
				logger.storeLogRecord( new adf.mf.internal.perf.AdfPerfLogRecord(mtype, msg, keyString, accTime, (accTime - _recordStartTime)) );
			}
            
		} // end of if enabled block
	};


	/**
	 * @returns true if the client level user story support is valid
	 *               (i.e. performance logging level is either FINE, FINER, or FINEST)
	 *       or false otherwise
	 */
	/* boolean */
	adf.mf.internal.perf.story.isEnabled = function()
	{
		return ((adf.mf.log.Performance.isLoggable(adf.mf.log.level.FINE))  || 
			    (adf.mf.log.Performance.isLoggable(adf.mf.log.level.FINER)) ||
			    (adf.mf.log.Performance.isLoggable(adf.mf.log.level.FINEST)));
	};
	
	
	/**
	 * Used to start a named user story.  User stories are captured in the
	 * peformance logging output.
	 */
	/* void */
	adf.mf.internal.perf.story.start = function(/* String */ name)
	{
		if ((adf.mf.log.Performance.isLoggable(adf.mf.log.level.FINE))  || 
		    (adf.mf.log.Performance.isLoggable(adf.mf.log.level.FINER)) ||
		    (adf.mf.log.Performance.isLoggable(adf.mf.log.level.FINEST)))
		{
			_currentStory.push(name);
			adf.mf.internal.perf.enterBlock();
			adf.mf.internal.perf.log("START.STORY", false, false, true, "user story", name, "");
		}
	};
	
	/**
	 * Used to stop the current user story.  User stories are captured in the
	 * peformance logging output.
	 */
	/* void */
	adf.mf.internal.perf.story.stop = function()
	{
		if ((adf.mf.log.Performance.isLoggable(adf.mf.log.level.FINE))  || 
			(adf.mf.log.Performance.isLoggable(adf.mf.log.level.FINER)) ||
			(adf.mf.log.Performance.isLoggable(adf.mf.log.level.FINEST)))
		{
			var name = _currentStory.pop();
			
			if(name !== undefined)
			{
				adf.mf.internal.perf.log("STOP.STORY", (_depth == 1), false, true, "user story", name, "");
				adf.mf.internal.perf.leaveBlock();
			}
			else
			{
				adf.mf.log.Framework.logp(adf.mf.log.level.FINE, "adf.mf.internal.perf.story", "stop",
	               "attempting to stop an user story but there are no started stories.");
			}
		}
	};
})();






/////////////////////////////////////// end of /Users/buildprocess/HudsonHome/jobs/adfmf-v11-11.1.2.4.1-tip/workspace/Container/JavaScript/ADF/js/AdfPerfTiming.js///////////////////////////////////////



/////////////////////////////////////// start of /Users/buildprocess/HudsonHome/jobs/adfmf-v11-11.1.2.4.1-tip/workspace/Container/JavaScript/ADF/js/TreeNodeELResolver.js///////////////////////////////////////

// @requires ELErrors
// @requires ArrayELResolver


var adf                    = window.adf                 || {};
adf.mf                     = adf.mf                     || {};
adf.mf.api                 = adf.mf.api                 || {};
adf.mf.el                  = adf.mf.el                  || {};
adf.mf.locale              = adf.mf.locale              || {};
adf.mf.log                 = adf.mf.log                 || {};
adf.mf.resource            = adf.mf.resource            || {};
adf.mf.util                = adf.mf.util                || {};

adf.mf.internal            = adf.mf.internal            || {};
adf.mf.internal.api        = adf.mf.internal.api        || {};
adf.mf.internal.el         = adf.mf.internal.el         || {};
adf.mf.internal.el.parser  = adf.mf.internal.el.parser  || {};
adf.mf.internal.locale     = adf.mf.internal.locale     || {};
adf.mf.internal.log        = adf.mf.internal.log        || {};
adf.mf.internal.mb         = adf.mf.internal.mb         || {};
adf.mf.internal.perf       = adf.mf.internal.perf       || {};
adf.mf.internal.perf.story = adf.mf.internal.perf.story || {};
adf.mf.internal.resource   = adf.mf.internal.resource   || {};
adf.mf.internal.util       = adf.mf.internal.util       || {};

/**
 * Defines property resolution behavior on instances of java.util.Map. This resolver handles base
 * objects of type java.util.Map. It accepts any object as a property and uses that object as a key
 * in the map. The resulting value is the value in the map that is associated with that key. This
 * resolver can be constructed in read-only mode, which means that isReadOnly will always return
 * true and {@link #setValue(ELContext, Object, Object, Object)} will always throw
 * PropertyNotWritableException. ELResolvers are combined together using {@link CompositeELResolver}
 * s, to define rich semantics for evaluating an expression. See the javadocs for {@link ELResolver}
 * for details.
 */
(function() {
	function TreeNodeELResolver(/* boolean */ readonly) {
		this.readOnly   = (readonly === undefined)? false : readonly;


		/**
		 * If the base object is a map, returns the most general type that this resolver accepts for the
		 * property argument. Otherwise, returns null. Assuming the base is a Map, this method will
		 * always return Object.class. This is because Maps accept any object as a key.
		 * 
		 * @param context
		 *            The context of this evaluation.
		 * @param base
		 *            The map to analyze. Only bases of type Map are handled by this resolver.
		 * @return null if base is not a Map; otherwise Object.class.
		 */
		/* Type */
		this.getCommonPropertyType = function(/* ELContext */ context, /* object */ base) {
			return this.isResolvable(base) ? (typeof base) : null;
		};
		

		/**
		 * If the base object is a map, returns an Iterator containing the set of keys available in the
		 * Map. Otherwise, returns null. The Iterator returned must contain zero or more instances of
		 * java.beans.FeatureDescriptor. Each info object contains information about a key in the Map,
		 * and is initialized as follows:
		 * <ul>
		 * <li>displayName - The return value of calling the toString method on this key, or "null" if
		 * the key is null</li>
		 * <li>name - Same as displayName property</li>
		 * <li>shortDescription - Empty string</li>
		 * <li>expert - false</li>
		 * <li>hidden - false</li>
		 * <li>preferred - true</li>
		 * </ul>
		 * In addition, the following named attributes must be set in the returned FeatureDescriptors:
		 * <ul>
		 * <li>{@link ELResolver#TYPE} - The return value of calling the getClass() method on this key,
		 * or null if the key is null.</li>
		 * <li>{@link ELResolver#RESOLVABLE_AT_DESIGN_TIME} - true</li>
		 * </ul>
		 * 
		 * @param context
		 *            The context of this evaluation.
		 * @param base
		 *            The map to analyze. Only bases of type Map are handled by this resolver.
		 * @return An Iterator containing zero or more (possibly infinitely more) FeatureDescriptor
		 *         objects, each representing a key in this map, or null if the base object is not a
		 *         map.
		 */
		/* Iterator<FeatureDescriptor> */
		this.getFeatureDescriptors = function(/* ELContext */ context, /* object */base) {
			throw new adf.mf.UnsupportedOperationException("feature descriptions not available");
		};
		

		/**
		 * If the base object is a map, returns the most general acceptable type for a value in this
		 * map. If the base is a Map, the propertyResolved property of the ELContext object must be set
		 * to true by this resolver, before returning. If this property is not true after this method is
		 * called, the caller should ignore the return value. Assuming the base is a Map, this method
		 * will always return Object.class. This is because Maps accept any object as the value for a
		 * given key.
		 * 
		 * @param context
		 *            The context of this evaluation.
		 * @param base
		 *            The map to analyze. Only bases of type Map are handled by this resolver.
		 * @param property
		 *            The key to return the acceptable type for. Ignored by this resolver.
		 * @return If the propertyResolved property of ELContext was set to true, then the most general
		 *         acceptable type; otherwise undefined.
		 * @throws NullPointerException
		 *             if context is null
		 * @throws ELException
		 *             if an exception was thrown while performing the property or variable resolution.
		 *             The thrown exception must be included as the cause property of this exception, if
		 *             available.
		 */
		/* Type */
		this.getType = function(/* ELContext */ context, /* object */ base, /* object */ property) {
			if((context === undefined) || (context === null)) {
				throw new adf.mf.NullPointerException("context is null");
			}
			
			var result = null;
			if (this.isResolvable(base)) {
				context.setPropertyResolved(true);
				result = (typeof base[property]) | 'object';
			}
			return result;
		};
		

		/**
		 * If the base object is a map, returns the value associated with the given key, as specified by
		 * the property argument. If the key was not found, null is returned. If the base is a Map, the
		 * propertyResolved property of the ELContext object must be set to true by this resolver,
		 * before returning. If this property is not true after this method is called, the caller should
		 * ignore the return value. Just as in java.util.Map.get(Object), just because null is returned
		 * doesn't mean there is no mapping for the key; it's also possible that the Map explicitly maps
		 * the key to null.
		 * 
		 * @param context
		 *            The context of this evaluation.
		 * @param base
		 *            The map to analyze. Only bases of type Map are handled by this resolver.
		 * @param property
		 *            The key to return the acceptable type for. Ignored by this resolver.
		 * @return If the propertyResolved property of ELContext was set to true, then the value
		 *         associated with the given key or null if the key was not found. Otherwise, undefined.
		 * @throws ClassCastException
		 *             if the key is of an inappropriate type for this map (optionally thrown by the
		 *             underlying Map).
		 * @throws NullPointerException
		 *             if context is null, or if the key is null and this map does not permit null keys
		 *             (the latter is optionally thrown by the underlying Map).
		 * @throws ELException
		 *             if an exception was thrown while performing the property or variable resolution.
		 *             The thrown exception must be included as the cause property of this exception, if
		 *             available.
		 */
		/* object */
		this.getValue = function(/* ELContext */ context, /* TreeNode */ base, /* object */ property) {
			if (context === null) {
				throw new adf.mf.NullPointerException("context is null");
			}
			
			var result = null;
			
			if (this.isResolvable(base)) 
			{
				// adf.mf.internal.perf.trace("adf.mf.internal.el.TreeNodeELResolver", "getValue: " + property);	
				if(property == "bindings")
				{
					result      = new adf.mf.internal.el.AttributeBinding(base); 
				}
				else if(property.toLowerCase() == "rowkey")
				{
					result = base.rowKey();
				}
				else if(property == "dataProvider")
				{
					result = base.getProvider();
				}
				else
				{
					var dp = base.getProvider() || {};
					result = dp[property];
				}
				context.setPropertyResolved(result !== undefined);
			}
			return result;
		};
		

		/**
		 * If the base object is a map, returns whether a call to
		 * {@link #setValue(ELContext, Object, Object, Object)} will always fail. If the base is a Map,
		 * the propertyResolved property of the ELContext object must be set to true by this resolver,
		 * before returning. If this property is not true after this method is called, the caller should
		 * ignore the return value. If this resolver was constructed in read-only mode, this method will
		 * always return true. If a Map was created using java.util.Collections.unmodifiableMap(Map),
		 * this method must return true. Unfortunately, there is no Collections API method to detect
		 * this. However, an implementation can create a prototype unmodifiable Map and query its
		 * runtime type to see if it matches the runtime type of the base object as a workaround.
		 * 
		 * @param context
		 *            The context of this evaluation.
		 * @param base
		 *            The map to analyze. Only bases of type Map are handled by this resolver.
		 * @param property
		 *            The key to return the acceptable type for. Ignored by this resolver.
		 * @return If the propertyResolved property of ELContext was set to true, then true if calling
		 *         the setValue method will always fail or false if it is possible that such a call may
		 *         succeed; otherwise undefined.
		 * @throws NullPointerException
		 *             if context is null.
		 * @throws ELException
		 *             if an exception was thrown while performing the property or variable resolution.
		 *             The thrown exception must be included as the cause property of this exception, if
		 *             available.
		 */
		/* boolean */
		this.isReadOnly = function(/* ELContext */ context, /* object */ base, /* object */ property) {
			if (context === null) {
				throw new adf.mf.NullPointerException("context is null");
			}
			if (this.isResolvable(base)) {
				context.setPropertyResolved(true);
			}
			return this.readOnly;
		};
		

		/**
		 * If the base object is a map, attempts to set the value associated with the given key, as
		 * specified by the property argument. If the base is a Map, the propertyResolved property of
		 * the ELContext object must be set to true by this resolver, before returning. If this property
		 * is not true after this method is called, the caller can safely assume no value was set. If
		 * this resolver was constructed in read-only mode, this method will always throw
		 * PropertyNotWritableException. If a Map was created using
		 * java.util.Collections.unmodifiableMap(Map), this method must throw
		 * PropertyNotWritableException. Unfortunately, there is no Collections API method to detect
		 * this. However, an implementation can create a prototype unmodifiable Map and query its
		 * runtime type to see if it matches the runtime type of the base object as a workaround.
		 * 
		 * @param context
		 *            The context of this evaluation.
		 * @param base
		 *            The map to analyze. Only bases of type Map are handled by this resolver.
		 * @param property
		 *            The key to return the acceptable type for. Ignored by this resolver.
		 * @param value
		 *            The value to be associated with the specified key.
		 * @throws ClassCastException
		 *             if the class of the specified key or value prevents it from being stored in this
		 *             map.
		 * @throws NullPointerException
		 *             if context is null, or if this map does not permit null keys or values, and the
		 *             specified key or value is null.
		 * @throws IllegalArgumentException
		 *             if some aspect of this key or value prevents it from being stored in this map.
		 * @throws PropertyNotWritableException
		 *             if this resolver was constructed in read-only mode, or if the put operation is
		 *             not supported by the underlying map.
		 * @throws ELException
		 *             if an exception was thrown while performing the property or variable resolution.
		 *             The thrown exception must be included as the cause property of this exception, if
		 *             available.
		 */
		/* void */
		this.setValue = function(/* ELContext */ context, /* object */ base, /* object */ property, /* object */ value) {
			if (context === null) {
				throw new adf.mf.NullPointerException("context is null");
			}
			if (this.isResolvable(base)) {
				if (this.readOnly) {
					throw new adf.mf.PropertyNotWritableException("resolver is read-only");
				}
				
				/* special cases: 
				 *    inputValue: need to written to the provider's object and not here
				 */
				if(property == "bindings")
				{
					base.bindings = value;
				}
				else if(property == "dataProvider")
				{
					base.dataProvider = value;
				}
				else
				{
					var dp = base.getProvider() || {};
					dp[property]  = value;
				}
				context.setPropertyResolved(true);
			}
		};
		

		/**
		 * Test whether the given base should be resolved by this ELResolver.
		 * 
		 * @param base
		 *            The bean to analyze.
		 * @param property
		 *            The name of the property to analyze. Will be coerced to a String.
		 * @return base is a Property Map
		 */
		/* boolean */ 
		this.isResolvable = function(/* object */ base) {
			return ((base !== null) && ((typeof base) == 'object') && (base['.type'] == 'oracle.adfmf.bindings.dbf.TreeNode'));
		};
	};
	
	adf.mf.internal.el.TreeNodeELResolver = TreeNodeELResolver;
})();



/////////////////////////////////////// end of /Users/buildprocess/HudsonHome/jobs/adfmf-v11-11.1.2.4.1-tip/workspace/Container/JavaScript/ADF/js/TreeNodeELResolver.js///////////////////////////////////////



/////////////////////////////////////// start of /Users/buildprocess/HudsonHome/jobs/adfmf-v11-11.1.2.4.1-tip/workspace/Container/JavaScript/ADF/js/TreeBindingsELResolver.js///////////////////////////////////////

// @requires ELErrors
// @requires ArrayELResolver


var adf                    = window.adf                 || {};
adf.mf                     = adf.mf                     || {};
adf.mf.api                 = adf.mf.api                 || {};
adf.mf.el                  = adf.mf.el                  || {};
adf.mf.locale              = adf.mf.locale              || {};
adf.mf.log                 = adf.mf.log                 || {};
adf.mf.resource            = adf.mf.resource            || {};
adf.mf.util                = adf.mf.util                || {};

adf.mf.internal            = adf.mf.internal            || {};
adf.mf.internal.api        = adf.mf.internal.api        || {};
adf.mf.internal.el         = adf.mf.internal.el         || {};
adf.mf.internal.el.parser  = adf.mf.internal.el.parser  || {};
adf.mf.internal.locale     = adf.mf.internal.locale     || {};
adf.mf.internal.log        = adf.mf.internal.log        || {};
adf.mf.internal.mb         = adf.mf.internal.mb         || {};
adf.mf.internal.perf       = adf.mf.internal.perf       || {};
adf.mf.internal.perf.story = adf.mf.internal.perf.story || {};
adf.mf.internal.resource   = adf.mf.internal.resource   || {};
adf.mf.internal.util       = adf.mf.internal.util       || {};

(function() {
	/**
	 * Defines property resolution behavior on instances of java.util.Map. This resolver handles base
	 * objects of type java.util.Map. It accepts any object as a property and uses that object as a key
	 * in the map. The resulting value is the value in the map that is associated with that key. This
	 * resolver can be constructed in read-only mode, which means that isReadOnly will always return
	 * true and {@link #setValue(ELContext, Object, Object, Object)} will always throw
	 * PropertyNotWritableException. ELResolvers are combined together using {@link CompositeELResolver}
	 * s, to define rich semantics for evaluating an expression. See the javadocs for {@link ELResolver}
	 * for details.
	 */
	function TreeBindingsELResolver(/* boolean */ readonly) {
		this.readOnly   = (readonly === undefined)? false : readonly;
		this.inBindings = false;


		/**
		 * If the base object is a map, returns the most general type that this resolver accepts for the
		 * property argument. Otherwise, returns null. Assuming the base is a Map, this method will
		 * always return Object.class. This is because Maps accept any object as a key.
		 * 
		 * @param context
		 *            The context of this evaluation.
		 * @param base
		 *            The map to analyze. Only bases of type Map are handled by this resolver.
		 * @return null if base is not a Map; otherwise Object.class.
		 */
		/* Type */
		this.getCommonPropertyType = function(/* ELContext */ context, /* object */ base) {
			return this.isResolvable(base) ? (typeof base) : null;
		};
		

		/**
		 * If the base object is a map, returns an Iterator containing the set of keys available in the
		 * Map. Otherwise, returns null. The Iterator returned must contain zero or more instances of
		 * java.beans.FeatureDescriptor. Each info object contains information about a key in the Map,
		 * and is initialized as follows:
		 * <ul>
		 * <li>displayName - The return value of calling the toString method on this key, or "null" if
		 * the key is null</li>
		 * <li>name - Same as displayName property</li>
		 * <li>shortDescription - Empty string</li>
		 * <li>expert - false</li>
		 * <li>hidden - false</li>
		 * <li>preferred - true</li>
		 * </ul>
		 * In addition, the following named attributes must be set in the returned FeatureDescriptors:
		 * <ul>
		 * <li>{@link ELResolver#TYPE} - The return value of calling the getClass() method on this key,
		 * or null if the key is null.</li>
		 * <li>{@link ELResolver#RESOLVABLE_AT_DESIGN_TIME} - true</li>
		 * </ul>
		 * 
		 * @param context
		 *            The context of this evaluation.
		 * @param base
		 *            The map to analyze. Only bases of type Map are handled by this resolver.
		 * @return An Iterator containing zero or more (possibly infinitely more) FeatureDescriptor
		 *         objects, each representing a key in this map, or null if the base object is not a
		 *         map.
		 */
		/* Iterator<FeatureDescriptor> */
		this.getFeatureDescriptors = function(/* ELContext */ context, /* object */base) {
			throw new adf.mf.UnsupportedOperationException("feature descriptions not available");
		};
		

		/**
		 * If the base object is a map, returns the most general acceptable type for a value in this
		 * map. If the base is a Map, the propertyResolved property of the ELContext object must be set
		 * to true by this resolver, before returning. If this property is not true after this method is
		 * called, the caller should ignore the return value. Assuming the base is a Map, this method
		 * will always return Object.class. This is because Maps accept any object as the value for a
		 * given key.
		 * 
		 * @param context
		 *            The context of this evaluation.
		 * @param base
		 *            The map to analyze. Only bases of type Map are handled by this resolver.
		 * @param property
		 *            The key to return the acceptable type for. Ignored by this resolver.
		 * @return If the propertyResolved property of ELContext was set to true, then the most general
		 *         acceptable type; otherwise undefined.
		 * @throws NullPointerException
		 *             if context is null
		 * @throws ELException
		 *             if an exception was thrown while performing the property or variable resolution.
		 *             The thrown exception must be included as the cause property of this exception, if
		 *             available.
		 */
		/* Type */
		this.getType = function(/* ELContext */ context, /* object */ base, /* object */ property) {
			if((context === undefined) || (context === null)) {
				throw new adf.mf.NullPointerException("context is null");
			}
			
			var result = null;
			if (this.isResolvable(base)) {
				context.setPropertyResolved(true);

				if(property == 'collectionModel')
				{
					result = (typeof base.bindings) || 'TreeBindings';
				}
				else
				{
					var ab = base.columnAttributes() || {};

					result = (typeof ab[property]) || 'AttributeBindings';
				}
			}
			return result;
		};
		

		/**
		 * If the base object is a map, returns the value associated with the given key, as specified by
		 * the property argument. If the key was not found, null is returned. If the base is a Map, the
		 * propertyResolved property of the ELContext object must be set to true by this resolver,
		 * before returning. If this property is not true after this method is called, the caller should
		 * ignore the return value. Just as in java.util.Map.get(Object), just because null is returned
		 * doesn't mean there is no mapping for the key; it's also possible that the Map explicitly maps
		 * the key to null.
		 * 
		 * @param context
		 *            The context of this evaluation.
		 * @param base
		 *            The map to analyze. Only bases of type Map are handled by this resolver.
		 * @param property
		 *            The key to return the acceptable type for. Ignored by this resolver.
		 * @return If the propertyResolved property of ELContext was set to true, then the value
		 *         associated with the given key or null if the key was not found. Otherwise, undefined.
		 * @throws ClassCastException
		 *             if the key is of an inappropriate type for this map (optionally thrown by the
		 *             underlying Map).
		 * @throws NullPointerException
		 *             if context is null, or if the key is null and this map does not permit null keys
		 *             (the latter is optionally thrown by the underlying Map).
		 * @throws ELException
		 *             if an exception was thrown while performing the property or variable resolution.
		 *             The thrown exception must be included as the cause property of this exception, if
		 *             available.
		 */
		/* object */
		this.getValue = function(/* ELContext */ context, /* object */ base, /* object */ property) {
			if (context === null) {
				throw new adf.mf.NullPointerException("context is null");
			}
			
			var result = null;
			
			if (this.isResolvable(base)) {
				// adf.mf.internal.perf.trace("adf.mf.internal.el.TreeBindingsELResolver", "getValue: " + property);	
				/* special cases: 
				 *    inputValue: need to read to the provider's object and not here
				 */
				if(property == 'iterator')
				{
					try
					{
						result   = new adf.mf.el.TreeNodeIterator(base, 0);
						
						if (adf.mf.log.Performance.isLoggable(adf.mf.log.level.FINE))
						{
							adf.mf.internal.perf.snapshot("adf.mf.internal.el.TreeBindingsELResolver", 
				                                          "resolved iterator with " + result.getCachedRowCount(0) + " rows cached.");
						}
					}
					catch(ie)
					{
						adf.mf.internal.perf.trace("adf.mf.internal.el.TreeBindingsELResolver", 
								                   "resolving the iterator resulted in an exception: " + ie);
					}
				}
				else if(base[property] !== undefined)
				{
					result = base[property];
				}
				else
				{
					var ab = base.columnAttributes() || {};
					result = ab[property];
				}
				context.setPropertyResolved(result !== undefined);
			}
			return result;
		};
		

		/**
		 * If the base object is a map, returns whether a call to
		 * {@link #setValue(ELContext, Object, Object, Object)} will always fail. If the base is a Map,
		 * the propertyResolved property of the ELContext object must be set to true by this resolver,
		 * before returning. If this property is not true after this method is called, the caller should
		 * ignore the return value. If this resolver was constructed in read-only mode, this method will
		 * always return true. If a Map was created using java.util.Collections.unmodifiableMap(Map),
		 * this method must return true. Unfortunately, there is no Collections API method to detect
		 * this. However, an implementation can create a prototype unmodifiable Map and query its
		 * runtime type to see if it matches the runtime type of the base object as a workaround.
		 * 
		 * @param context
		 *            The context of this evaluation.
		 * @param base
		 *            The map to analyze. Only bases of type Map are handled by this resolver.
		 * @param property
		 *            The key to return the acceptable type for. Ignored by this resolver.
		 * @return If the propertyResolved property of ELContext was set to true, then true if calling
		 *         the setValue method will always fail or false if it is possible that such a call may
		 *         succeed; otherwise undefined.
		 * @throws NullPointerException
		 *             if context is null.
		 * @throws ELException
		 *             if an exception was thrown while performing the property or variable resolution.
		 *             The thrown exception must be included as the cause property of this exception, if
		 *             available.
		 */
		/* boolean */
		this.isReadOnly = function(/* ELContext */ context, /* object */ base, /* object */ property) {
			if (context === null) {
				throw new adf.mf.NullPointerException("context is null");
			}
			if (this.isResolvable(base)) {
				context.setPropertyResolved(true);
			}
			return this.readOnly;
		};
		

		/**
		 * If the base object is a map, attempts to set the value associated with the given key, as
		 * specified by the property argument. If the base is a Map, the propertyResolved property of
		 * the ELContext object must be set to true by this resolver, before returning. If this property
		 * is not true after this method is called, the caller can safely assume no value was set. If
		 * this resolver was constructed in read-only mode, this method will always throw
		 * PropertyNotWritableException. If a Map was created using
		 * java.util.Collections.unmodifiableMap(Map), this method must throw
		 * PropertyNotWritableException. Unfortunately, there is no Collections API method to detect
		 * this. However, an implementation can create a prototype unmodifiable Map and query its
		 * runtime type to see if it matches the runtime type of the base object as a workaround.
		 * 
		 * @param context
		 *            The context of this evaluation.
		 * @param base
		 *            The map to analyze. Only bases of type Map are handled by this resolver.
		 * @param property
		 *            The key to return the acceptable type for. Ignored by this resolver.
		 * @param value
		 *            The value to be associated with the specified key.
		 * @throws ClassCastException
		 *             if the class of the specified key or value prevents it from being stored in this
		 *             map.
		 * @throws NullPointerException
		 *             if context is null, or if this map does not permit null keys or values, and the
		 *             specified key or value is null.
		 * @throws IllegalArgumentException
		 *             if some aspect of this key or value prevents it from being stored in this map.
		 * @throws PropertyNotWritableException
		 *             if this resolver was constructed in read-only mode, or if the put operation is
		 *             not supported by the underlying map.
		 * @throws ELException
		 *             if an exception was thrown while performing the property or variable resolution.
		 *             The thrown exception must be included as the cause property of this exception, if
		 *             available.
		 */
		/* void */
		this.setValue = function(/* ELContext */ context, /* object */ base, /* object */ property, /* object */ value) {
			if (context === null) {
				throw new adf.mf.NullPointerException("context is null");
			}
			if (this.isResolvable(base)) {
				if (this.readOnly) {
					throw new adf.mf.PropertyNotWritableException("resolver is read-only");
				}
				
				/* special cases: 
				 *    inputValue: need to written to the provider's object and not here
				 */
				if(property == 'iterator')
				{
					throw new adf.mf.PropertyNotWritableException("resolver is read-only");
				}
				else if(base[property] !== undefined)
				{
					base[property] = value;
				}
				else 
				{
					if((typeof value) !== 'AttributeBindings')
					{
						throw new adf.mf.IllegalArgumentException("value is not a AttributeBindings object");
					}
					
					var ab = base.columnAttributes() || {};
					ab[property] = value;
				}
				context.setPropertyResolved(true);
			}
		};
		

		/**
		 * Test whether the given base should be resolved by this ELResolver.
		 * 
		 * @param base
		 *            The bean to analyze.
		 * @param property
		 *            The name of the property to analyze. Will be coerced to a String.
		 * @return base is a Property Map
		 */
		/* boolean */ 
		this.isResolvable = function(/* object */ base) {
			return ((base !== null) && ((typeof base) == 'object') && (base['.type'] == 'TreeBindings'));
		};
	};
	
	adf.mf.internal.el.TreeBindingsELResolver = TreeBindingsELResolver;
})();



/////////////////////////////////////// end of /Users/buildprocess/HudsonHome/jobs/adfmf-v11-11.1.2.4.1-tip/workspace/Container/JavaScript/ADF/js/TreeBindingsELResolver.js///////////////////////////////////////



/////////////////////////////////////// start of /Users/buildprocess/HudsonHome/jobs/adfmf-v11-11.1.2.4.1-tip/workspace/Container/JavaScript/ADF/js/Utilities.js///////////////////////////////////////

// @requires AdfPerfTiming


var adf                                       = window.adf                                    || {};
adf.mf                                        = adf.mf                                        || {};
adf.mf.api                                    = adf.mf.api                                    || {};
adf.mf.el                                     = adf.mf.el                                     || {};
adf.mf.locale                                 = adf.mf.locale                                 || {};
adf.mf.log                                    = adf.mf.log                                    || {};
adf.mf.resource                               = adf.mf.resource                               || {};
adf.mf.util                                   = adf.mf.util                                   || {};

adf.mf.internal                               = adf.mf.internal                               || {};
adf.mf.internal.api                           = adf.mf.internal.api                           || {};
adf.mf.internal.converters                    = adf.mf.internal.converters                    || {};
adf.mf.internal.converters.dateParser         = adf.mf.internal.converters.dateParser         || {};
adf.mf.internal.converters.dateParser.iso8601 = adf.mf.internal.converters.dateParser.iso8601 || {};
adf.mf.internal.el                            = adf.mf.internal.el                            || {};
adf.mf.internal.el.parser                     = adf.mf.internal.el.parser                     || {};
adf.mf.internal.locale                        = adf.mf.internal.locale                        || {};
adf.mf.internal.log                           = adf.mf.internal.log                           || {};
adf.mf.internal.mb                            = adf.mf.internal.mb                            || {};
adf.mf.internal.perf                          = adf.mf.internal.perf                          || {};
adf.mf.internal.perf.story                    = adf.mf.internal.perf.story                    || {};
adf.mf.internal.resource                      = adf.mf.internal.resource                      || {};
adf.mf.internal.util                          = adf.mf.internal.util                          || {};


/**
 * startBatchRequest marks the start of the batch request.  Once this function is called
 * all subsequent requests to the java layer will be deferred until the flushBatchRequest.
 * Between the start and flush batch request markers, all requests success callbacks will
 * be called with deferred object ({.deferred:true}) response object.
 *
 * @see adf.mf.util.flushBatchRequest
 */
/* void */
adf.mf.util.startBatchRequest = function()
{
	if(adf.mf.internal.batchRequest != undefined)
	{
		throw new adf.mf.ELException("Batch Request already started.");
	}
	adf.mf.internal.batchRequest = [];
};


/* boolean */
adf.mf.util.isException = function(/* exception object */ obj)
{
	var o       = ((obj != undefined) && ('object' == typeof obj))? obj : {};
	var e       = (o[adf.mf.internal.api.constants.EXCEPTION_FLAG_PROPERTY] === true);

	if(e)  return e;
	else { /* lets see if it ends with Exception */
		return adf.mf.util.isType(o, "Exception");
	}
};


/* boolean */
adf.mf.util.isType = function(/* object */ obj, /* type name */ tname)
{
	var o       = ((obj != undefined) && ('object' == typeof obj))? obj : {};
	var type    = o[adf.mf.internal.api.constants.TYPE_PROPERTY] || "unknown";

	return (type.length == tname.length)?
			(type == tname) :
		    (type.indexOf(tname, type.length - tname.length) != -1);
};


/**
 * Where startBatchRequest marks the start of the batch request, flushBatchRequest marks
 * the end of the batch and flushes (processes) the requests.  The caller can determine
 * if the flush should abort of the first error or continue to completion by passing either
 * true or false in the abortOnError parameter.  Regardless, the success callbacks will
 * be called in order if the batch is deemed successful otherwise the failed callbacks
 * will be invoked.  The callbacks parameters will be a vector of requests/responses one
 * for each request that was batched.
 *
 * @see adf.mf.util.startBatchRequest
 */
/* void */
adf.mf.util.flushBatchRequest = function(/* boolean abortOnError, callback success, callback failed, [boolean ignoreErrorMessages]*/)
{
 var argv  = arguments;
 var argc  = arguments.length;
 var scb   = [];
 var fcb   = [];

 if (argc!=4 && argc!=3 && argc!=2)
 {
  throw new adf.mf.ELException("Wrong number of arguments");
 }

 var abortOnError   = argv[0] || false;
 var errorHandler   = ((argc == 4) && (argv[3] == true))?
                                      adf.mf.internal.api.nvpEatErrors :
                                      adf.mf.internal.api.arraySimulatedErrors;
 scb = scb.concat([errorHandler]);
 scb = scb.concat((adf.mf.internal.util.is_array(argv[1]))? argv[1] : [argv[1]]);
 scb = scb.concat([function() {adf.mf.internal.perf.stop("adf.mf.util.flushBatchRequest", "success");}]);

 fcb = fcb.concat((adf.mf.internal.util.is_array(argv[2]))? argv[2] : [argv[2]]);
 fcb = fcb.concat([function() {adf.mf.internal.perf.stop("adf.mf.util.flushBatchRequest", "failed");}]);

    adf.mf.internal.perf.start("adf.mf.util.flushBatchRequest");

 try
 {
  if((adf.mf.internal.batchRequest === undefined) || (adf.mf.internal.batchRequest === null))
  {  /* so we do not have a defined batch request */
   throw new adf.mf.IllegalStateException("batch request is not defined");
  }

  if(adf.mf.internal.batchRequest.length > 0)
  {  /* so we have pending requests */
   if(adf.mf.internal.isJavaAvailable())
   {
    var   requests = adf.mf.internal.batchRequest.slice(0);

    adf.mf.internal.perf.snapshot("adf.mf.util.flushBatchRequest",
                                           ("batch request contains " + requests.length + " requests."));

    adf.mf.internal.batchRequest = undefined;
    adf.mf.api.invokeMethod("oracle.adfmf.framework.api.Model",
      "processBatchRequests", abortOnError, requests, scb, fcb);
   }
   else
   {
    throw new adf.mf.IllegalStateException("invalid environment defined for batch request");
   }
  }
  else
  {  /* this is okay, let the called know we are done */
   adf.mf.internal.batchRequest = undefined;
   for(var i = 0; i < scb.length; ++i) { try { scb[i](); }catch(e){}; }
  }
 }
 catch(e)
 {  /* this is not good, let the caller know */
  for(var i = 0; i < fcb.length; ++i) { try { fcb[i](); }catch(e){}; }
 }
};


/* Array of Strings */
adf.mf.util.getTerms = function(/* EL String */el) {
	var exp   = adf.mf.internal.el.parser.parse(el);

	return exp.dependencies();
};



/**
 * Get the context free version of the passed in EL expression.
 **/
/* String */
adf.mf.util.getContextFreeExpression = function(/* EL Expression */ el)
{
    return adf.mf.internal.el.parser.parse(el).toContextFreeExpression();
};



/**
 * remove duplicate entries from the array 'arr'.  If 'arr' is
 * not an array the 'arr' object is simply returned.
 */
/* array */
adf.mf.util.removeDuplicates = function(/* Array */ arr)
{
	if(adf.mf.internal.util.is_array(arr))
	{
		arr.sort();
	    for(var i = 1; i < arr.length; )
	    {
	        if(arr[i-1] == arr[i])
	        {
	        	arr.splice(i, 1);
	        }
	        else
	        {
	            i++;
	        }
	    }
	}
    return arr;
};


/**
 * Convert the passed in object into a string representation for printing.
 *
 * @param   dat - data object to be converted
 * @returns string representation of the dat object
 */
/* String */
adf.mf.util.stringify = function(/* object */ dat)
{
  // Stringify is potentially costly, so profile it. The function call forwarding is made so
  // recursion does not spit out bunch of log timestamps
  adf.mf.internal.perf.start("adf.mf.util.stringify");

  // Forward the call so calee can recurse
  var return_value = adf.mf.internal.util.stringify(dat);

  adf.mf.internal.perf.stop("adf.mf.util.stringify");

  return return_value;
};


/**
 * Return the number of milliseconds since 01 January, 1970 UTC that the provided
 * date string represents. Attempt to use the native Date.parse, and fall back to
 * adf.mf.internal.converters.dateParser.iso8601.parse if the native one returns
 * NaN. Returns NaN if a valid date cannot be parsed.
 *
 * @param   dateString - string containing a date in a format supported natively,
              or ISO-8601
 * @returns the number of ms since 01 January, 1970 UTC, or NaN if not parsable
 */
/* Number */
adf.mf.internal.converters.dateParser.parse = function(dateStr)
{
  var dateParse = Date.parse(dateStr);

  if (isNaN(dateParse))
  {
    dateParse = adf.mf.internal.converters.dateParser.iso8601.parse(dateStr);
  }

  return dateParse;
}


/**
 * Return the number of milliseconds since 01 January, 1970 UTC that the provided
 * ISO 8601 date string represents.
 *
 * @param   iso8601String - ISO 8601 formatted date string
 * @returns the number of ms since 01 January, 1970 UTC, or NaN if not parsable
 *
 * Most of the information for this standard to support was taken from:
 * http://en.wikipedia.org/wiki/ISO_8601
 *
 * The following ISO 8601 formats are supported by this parser. For now, the date string
 * must be of the format <date> or <date>T<time>, not just a <time>.
 *
 * Dates:
 * YYYY
 * YYYY-MM-DD
 * YYYY-MM
 * YYYYMMDD
 *
 * Times:
 * hh:mm:ss
 * hh:mm
 * hhmmss
 * hhmm
 * hh
 *
 * Decimal fractions may also be added to any of the three time elements. A decimal mark,
 * either a comma or a dot (without any preference as stated in resolution 10 of the 22nd
 * General Conference CGPM in 2003, but with a preference for a comma according to ISO
 * 8601:2004) is used as a separator between the time element and its fraction. A fraction
 * may only be added to the lowest order time element in the representation. To denote "14
 * hours, 30 and one half minutes", do not include a seconds figure. Represent it as
 * "14:30,5", "1430,5", "14:30.5", or "1430.5". There is no limit on the number of decimal
 * places for the decimal fraction.
 *
 * Time zone designators:
 * <time>Z
 * <time>±hh:mm
 * <time>±hhmm
 * <time>±hh
 *
 * When the ISO 8601 string is applied against the regular expression, matches[] should contain
 * the following values. For MM/DD/mm/ss, only one of the corresponding array indicies for each
 * will contain data, the other remaining undefined. Which ones are populated depend on the use
 * of separator characters ('-', ':') in the ISO 8601 string.
 *
 * matches[1]   YYYY <- YYYY-MM-DDThh:mm:ss.fffZ        (the year)
 * matches[2]   MM   <- YYYYMMDDThh:mm:ss.fffZ          (the month when no hyphen separates year & month)
 * matches[3]   DD   <- YYYYMMDDThh:mm:ss.fffZ          (the day when no hyphen separates month & day)
 * matches[4]   MM   <- YYYY-MM-DDThh:mm:ss.fffZ        (the month when a hyphen separates year & month)
 * matches[5]   DD   <- YYYY-MM-DDThh:mm:ss.fffZ        (the day when a hyphen separates month & day)
 * matches[6]   hh   <- YYYY-MM-DDThh:mm:ss.fffZ        (the hours)
 * matches[7]   mm   <- YYYY-MM-DDThh:mm:ss.fffZ        (the minutes when no colon separates hours & minutes)
 * matches[8]   ss   <- YYYY-MM-DDThh:mm:ss.fffZ        (the seconds when no colon separates minutes & seconds)
 * matches[9]   mm   <- YYYY-MM-DDThhmmss.fffZ          (the minutes when a colon separates hours & minutes)
 * matches[10]  ss   <- YYYY-MM-DDThhmmss.fffZ          (the seconds when a colon separates minutes & seconds)
 * matches[11]  fff  <- YYYY-MM-DDThh.fffZ              (the fractional hours)
 *          or  fff  <- YYYY-MM-DDThhmm.fffZ            (the fractional minutes, with or without colon separator)
 *          or  fff  <- YYYY-MM-DDThhmmss.fffZ          (the fractional seconds, with or without colon separator)
 * matches[12]  Z    <- YYYY-MM-DDThh:mm:ss.fffZ        (Zulu time, aka +00:00)
 * matches[13]  ±    <- YYYY-MM-DDThh:mm:ss.fff±zh:zm   ('+' or '-'; the direction of the timezone offset)
 * matches[14]  zh   <- YYYY-MM-DDThh:mm:ss.fff-zh:zm   (the hours of the time zone offset)
 * matches[15]  zm   <- YYYY-MM-DDThh:mm:ss.fff-zh:zm   (the minutes of the time zone offset)
 */
/* Number */
adf.mf.internal.converters.dateParser.iso8601.parse = function(iso8601Str)
{
  var re = /^(\d{4})(?:(\d{2})(\d{2})|-(\d{2})(?:-(\d{2}))?)?(?:T(\d{2})(?::(\d{2})(?::(\d{2}))?|(\d{2})(?:(\d{2}))?)?(?:[,\.](\d+))?(?:(Z)|([+\-])(\d{2})(?::?(\d{2}))?)?)?$/;
  var matches = re.exec(iso8601Str);

  if (!matches)
  {
    return NaN;
  }

  var pc = this.constants;

  // assign parsed values to correct units, initializing with default if unspecified
  var year     = matches[pc.YEAR];
  var month    = matches[pc.MONTH]    || matches[pc.MONTH_HYPHEN]  || "1";
  var day      = matches[pc.DAY]      || matches[pc.DAY_HYPHEN]    || "1";
  var hours    = matches[pc.HOURS]    || "0";
  var minutes  = matches[pc.MINUTES]  || matches[pc.MINUTES_COLON] || "0";
  var seconds  = matches[pc.SECONDS]  || matches[pc.SECONDS_COLON] || "0";
  var fraction = matches[pc.FRACTION] || "0";
  var zulu     = matches[pc.ZULU];

  year = parseInt(year, 10);
  month = parseInt(month, 10);
  day = parseInt(day, 10);

  hours = parseInt(hours, 10);
  minutes = parseInt(minutes, 10);
  seconds = parseInt(seconds, 10);

  var fractionMillis = 0;

  // if fraction specified, determine which time part it belongs to and compute additional ms
  if (matches[pc.FRACTION])
  {
    fraction = parseFloat("." + fraction);

    if (matches[pc.SECONDS] || matches[pc.SECONDS_COLON])
    {
      fractionMillis = Math.round(fraction * 1000);       // 1000 = ms / second
    }
    else if (matches[pc.MINUTES] || matches[pc.MINUTES_COLON])
    {
      fractionMillis = Math.round(fraction * 60000);      // 60 * 1000 = ms / minute
    }
    else
    {
      fractionMillis = Math.round(fraction * 3600000);    // 60 * 60 * 1000 = ms / hour
    }
  }

  // create date from time parts (month is zero-based)
  var dateMillis = Date.UTC(year, month - 1, day, hours, minutes, seconds);

  dateMillis += fractionMillis;

  // adjust for timezone
  if (!zulu)
  {
    var tzPlus    = matches[pc.TZ_PLUS];
    var tzHours   = matches[pc.TZ_HOURS]   || "0";
    var tzMinutes = matches[pc.TZ_MINUTES] || "0";

    var offsetMillis = parseInt(tzHours, 10) * 3600000;   // 60 * 60 * 1000
    offsetMillis += parseInt(tzMinutes, 10) * 60000;      // 60 * 1000;

    if (tzPlus == "+")
    {
      dateMillis += offsetMillis;
    }
    else
    {
      dateMillis -= offsetMillis;
    }
  }

  return dateMillis;
}


adf.mf.internal.converters.dateParser.iso8601.constants =
{
  YEAR:          1,
  MONTH:         2,
  DAY:           3,
  MONTH_HYPHEN:  4,
  DAY_HYPHEN:    5,
  HOURS:         6,
  MINUTES:       7,
  SECONDS:       8,
  MINUTES_COLON: 9,
  SECONDS_COLON: 10,
  FRACTION:      11,
  ZULU:          12,
  TZ_PLUS:       13,
  TZ_HOURS:      14,
  TZ_MINUTES:    15
};

/**
 * INTERNAL FUNCTION used to do token subsitution on the passed in expression
 * with the replacementStack of name/value objects.
 */
adf.mf.internal.util.tokenSubsitution = function(/* string */ expression, /* array */ replacementStack)
{
	var result = expression;
	
	for(var i = 0; i < replacementStack.length; ++i)
	{
		var  replaceMap = replacementStack[i];
		var  ele        = adf.mf.internal.el.parser.parse(result);
		
		result = "#{" + ele.replaceTokens(true, replaceMap) + "}";
	}
	return result;
};


/**
 * INTERNAL FUNCTION used to actually implement the stringify functionality
 */
adf.mf.internal.util.stringify = function(dat)
{
	var buf = " ";

	if(dat instanceof Array) {
		for(var i = 0; i < dat.length; ++i) {
			buf += "[" + i + ":";
			buf +=  this.stringify(dat[i]);
			buf += "]";
		}
	}
	else if(typeof dat === 'object') {
		buf += "{";
		for(property in dat) {
			if((property !== undefined) && (property !== null)) {
		    	if((typeof dat[property]) != 'function')
		    	{
					buf += property + ":" + this.stringify(dat[property]) + "; ";
		    	}
			}
		}
		buf += "}";
	}
	else {
		buf += dat;
	}

	return buf;
};

/**
 * INTERNAL FUNCTION used to determine if the input is an array or not
 */
adf.mf.internal.util.is_array = function(input)
{
	return typeof(input)=='object'&&(input instanceof Array);
};


adf.mf.util.obfuscate = function(s) {
	return s.replace(/[a-zA-Z]/g, function(c) {
		return String.fromCharCode((c <= "Z"? 90 : 122) >= (c = c.charCodeAt(0) + 13) ? c : c - 26);
	});
};



/////////////////////////////////////// end of /Users/buildprocess/HudsonHome/jobs/adfmf-v11-11.1.2.4.1-tip/workspace/Container/JavaScript/ADF/js/Utilities.js///////////////////////////////////////



/////////////////////////////////////// start of /Users/buildprocess/HudsonHome/jobs/adfmf-v11-11.1.2.4.1-tip/workspace/Container/JavaScript/ADF/js/MapELResolver.js///////////////////////////////////////

// @requires ELErrors
// @requires ArrayELResolver


var adf                    = window.adf                 || {};
adf.mf                     = adf.mf                     || {};
adf.mf.api                 = adf.mf.api                 || {};
adf.mf.el                  = adf.mf.el                  || {};
adf.mf.locale              = adf.mf.locale              || {};
adf.mf.log                 = adf.mf.log                 || {};
adf.mf.resource            = adf.mf.resource            || {};
adf.mf.util                = adf.mf.util                || {};

adf.mf.internal            = adf.mf.internal            || {};
adf.mf.internal.api        = adf.mf.internal.api        || {};
adf.mf.internal.el         = adf.mf.internal.el         || {};
adf.mf.internal.el.parser  = adf.mf.internal.el.parser  || {};
adf.mf.internal.locale     = adf.mf.internal.locale     || {};
adf.mf.internal.log        = adf.mf.internal.log        || {};
adf.mf.internal.mb         = adf.mf.internal.mb         || {};
adf.mf.internal.perf       = adf.mf.internal.perf       || {};
adf.mf.internal.perf.story = adf.mf.internal.perf.story || {};
adf.mf.internal.resource   = adf.mf.internal.resource   || {};
adf.mf.internal.util       = adf.mf.internal.util       || {};

/**
 * Defines property resolution behavior on instances of java.util.Map. This resolver handles base
 * objects of type java.util.Map. It accepts any object as a property and uses that object as a key
 * in the map. The resulting value is the value in the map that is associated with that key. This
 * resolver can be constructed in read-only mode, which means that isReadOnly will always return
 * true and {@link #setValue(ELContext, Object, Object, Object)} will always throw
 * PropertyNotWritableException. ELResolvers are combined together using {@link CompositeELResolver}
 * s, to define rich semantics for evaluating an expression. See the javadocs for {@link ELResolver}
 * for details.
 */
adf.mf.internal.el.MapELResolver = function(/* boolean */ readonly) {
		this.readOnly = (readonly === undefined)? false : readonly;


	/**
	 * If the base object is a map, returns the most general type that this resolver accepts for the
	 * property argument. Otherwise, returns null. Assuming the base is a Map, this method will
	 * always return Object.class. This is because Maps accept any object as a key.
	 * 
	 * @param context
	 *            The context of this evaluation.
	 * @param base
	 *            The map to analyze. Only bases of type Map are handled by this resolver.
	 * @return null if base is not a Map; otherwise Object.class.
	 */
	/* Type */
	this.getCommonPropertyType = function(/* ELContext */ context, /* object */ base) {
		return this.isResolvable(base) ? (typeof base) : null;
	};
	

	/**
	 * If the base object is a map, returns an Iterator containing the set of keys available in the
	 * Map. Otherwise, returns null. The Iterator returned must contain zero or more instances of
	 * java.beans.FeatureDescriptor. Each info object contains information about a key in the Map,
	 * and is initialized as follows:
	 * <ul>
	 * <li>displayName - The return value of calling the toString method on this key, or "null" if
	 * the key is null</li>
	 * <li>name - Same as displayName property</li>
	 * <li>shortDescription - Empty string</li>
	 * <li>expert - false</li>
	 * <li>hidden - false</li>
	 * <li>preferred - true</li>
	 * </ul>
	 * In addition, the following named attributes must be set in the returned FeatureDescriptors:
	 * <ul>
	 * <li>{@link ELResolver#TYPE} - The return value of calling the getClass() method on this key,
	 * or null if the key is null.</li>
	 * <li>{@link ELResolver#RESOLVABLE_AT_DESIGN_TIME} - true</li>
	 * </ul>
	 * 
	 * @param context
	 *            The context of this evaluation.
	 * @param base
	 *            The map to analyze. Only bases of type Map are handled by this resolver.
	 * @return An Iterator containing zero or more (possibly infinitely more) FeatureDescriptor
	 *         objects, each representing a key in this map, or null if the base object is not a
	 *         map.
	 */
	/* Iterator<FeatureDescriptor> */
	this.getFeatureDescriptors = function(/* ELContext */ context, /* object */base) {
		throw new adf.mf.UnsupportedOperationException("feature descriptions not available");
	};
	

	/**
	 * If the base object is a map, returns the most general acceptable type for a value in this
	 * map. If the base is a Map, the propertyResolved property of the ELContext object must be set
	 * to true by this resolver, before returning. If this property is not true after this method is
	 * called, the caller should ignore the return value. Assuming the base is a Map, this method
	 * will always return Object.class. This is because Maps accept any object as the value for a
	 * given key.
	 * 
	 * @param context
	 *            The context of this evaluation.
	 * @param base
	 *            The map to analyze. Only bases of type Map are handled by this resolver.
	 * @param property
	 *            The key to return the acceptable type for. Ignored by this resolver.
	 * @return If the propertyResolved property of ELContext was set to true, then the most general
	 *         acceptable type; otherwise undefined.
	 * @throws NullPointerException
	 *             if context is null
	 * @throws ELException
	 *             if an exception was thrown while performing the property or variable resolution.
	 *             The thrown exception must be included as the cause property of this exception, if
	 *             available.
	 */
	/* Type */
	this.getType = function(/* ELContext */ context, /* object */ base, /* object */ property) {
		if((context === undefined) || (context === null)) {
			throw new adf.mf.NullPointerException("context is null");
		}
		
		var result = null;
		if (this.isResolvable(base)) {
			context.setPropertyResolved(true);
			result = (typeof base[property]) | 'object';
		}
		return result;
	};
	

	/**
	 * If the base object is a map, returns the value associated with the given key, as specified by
	 * the property argument. If the key was not found, null is returned. If the base is a Map, the
	 * propertyResolved property of the ELContext object must be set to true by this resolver,
	 * before returning. If this property is not true after this method is called, the caller should
	 * ignore the return value. Just as in java.util.Map.get(Object), just because null is returned
	 * doesn't mean there is no mapping for the key; it's also possible that the Map explicitly maps
	 * the key to null.
	 * 
	 * @param context
	 *            The context of this evaluation.
	 * @param base
	 *            The map to analyze. Only bases of type Map are handled by this resolver.
	 * @param property
	 *            The key to return the acceptable type for. Ignored by this resolver.
	 * @return If the propertyResolved property of ELContext was set to true, then the value
	 *         associated with the given key or null if the key was not found. Otherwise, undefined.
	 * @throws ClassCastException
	 *             if the key is of an inappropriate type for this map (optionally thrown by the
	 *             underlying Map).
	 * @throws NullPointerException
	 *             if context is null, or if the key is null and this map does not permit null keys
	 *             (the latter is optionally thrown by the underlying Map).
	 * @throws ELException
	 *             if an exception was thrown while performing the property or variable resolution.
	 *             The thrown exception must be included as the cause property of this exception, if
	 *             available.
	 */
	/* object */
	this.getValue = function(/* ELContext */ context, /* object */ base, /* object */ property) {
		if (context === null) {
			throw new adf.mf.NullPointerException("context is null");
		}

		var result = null;
		
		if (this.isResolvable(base)) {
			// adf.mf.internal.perf.trace("adf.mf.internal.el.MapELResolver", "getValue: " + property);	
			/* first attempt to get the property */
			result = base[property];

			/* if you were not able to find it _AND_ the property is bindings */
			if((result == undefined) && (typeof base == 'object') && ("bindings" == property))
			{
				/* then assume you are suppose to eat the bindings as a nested property */
				result = base;
			}
			context.setPropertyResolved(result !== undefined);
		}
		return result;
	};
	

	/**
	 * If the base object is a map, returns whether a call to
	 * {@link #setValue(ELContext, Object, Object, Object)} will always fail. If the base is a Map,
	 * the propertyResolved property of the ELContext object must be set to true by this resolver,
	 * before returning. If this property is not true after this method is called, the caller should
	 * ignore the return value. If this resolver was constructed in read-only mode, this method will
	 * always return true. If a Map was created using java.util.Collections.unmodifiableMap(Map),
	 * this method must return true. Unfortunately, there is no Collections API method to detect
	 * this. However, an implementation can create a prototype unmodifiable Map and query its
	 * runtime type to see if it matches the runtime type of the base object as a workaround.
	 * 
	 * @param context
	 *            The context of this evaluation.
	 * @param base
	 *            The map to analyze. Only bases of type Map are handled by this resolver.
	 * @param property
	 *            The key to return the acceptable type for. Ignored by this resolver.
	 * @return If the propertyResolved property of ELContext was set to true, then true if calling
	 *         the setValue method will always fail or false if it is possible that such a call may
	 *         succeed; otherwise undefined.
	 * @throws NullPointerException
	 *             if context is null.
	 * @throws ELException
	 *             if an exception was thrown while performing the property or variable resolution.
	 *             The thrown exception must be included as the cause property of this exception, if
	 *             available.
	 */
	/* boolean */
	this.isReadOnly = function(/* ELContext */ context, /* object */ base, /* object */ property) {
		if (context === null) {
			throw new adf.mf.NullPointerException("context is null");
		}
		if (this.isResolvable(base)) {
			context.setPropertyResolved(true);
		}
		return this.readOnly;
	};
	

	/**
	 * If the base object is a map, attempts to set the value associated with the given key, as
	 * specified by the property argument. If the base is a Map, the propertyResolved property of
	 * the ELContext object must be set to true by this resolver, before returning. If this property
	 * is not true after this method is called, the caller can safely assume no value was set. If
	 * this resolver was constructed in read-only mode, this method will always throw
	 * PropertyNotWritableException. If a Map was created using
	 * java.util.Collections.unmodifiableMap(Map), this method must throw
	 * PropertyNotWritableException. Unfortunately, there is no Collections API method to detect
	 * this. However, an implementation can create a prototype unmodifiable Map and query its
	 * runtime type to see if it matches the runtime type of the base object as a workaround.
	 * 
	 * @param context
	 *            The context of this evaluation.
	 * @param base
	 *            The map to analyze. Only bases of type Map are handled by this resolver.
	 * @param property
	 *            The key to return the acceptable type for. Ignored by this resolver.
	 * @param value
	 *            The value to be associated with the specified key.
	 * @throws ClassCastException
	 *             if the class of the specified key or value prevents it from being stored in this
	 *             map.
	 * @throws NullPointerException
	 *             if context is null, or if this map does not permit null keys or values, and the
	 *             specified key or value is null.
	 * @throws IllegalArgumentException
	 *             if some aspect of this key or value prevents it from being stored in this map.
	 * @throws PropertyNotWritableException
	 *             if this resolver was constructed in read-only mode, or if the put operation is
	 *             not supported by the underlying map.
	 * @throws ELException
	 *             if an exception was thrown while performing the property or variable resolution.
	 *             The thrown exception must be included as the cause property of this exception, if
	 *             available.
	 */
	/* void */
	this.setValue = function(/* ELContext */ context, /* object */ base, /* object */ property, /* object */ value) {
		if (context === null) {
			throw new adf.mf.NullPointerException("context is null");
		}
		if (this.isResolvable(base)) {
			if (this.readOnly) {
				throw new adf.mf.PropertyNotWritableException("resolver is read-only");
			}
			base[property] = value;
			context.setPropertyResolved(true);
		}
	};
	

	/**
	 * Test whether the given base should be resolved by this ELResolver.
	 * 
	 * @param base
	 *            The bean to analyze.
	 * @param property
	 *            The name of the property to analyze. Will be coerced to a String.
	 * @return base is a Property Map
	 */
	/* boolean */ 
	this.isResolvable = function(/* object */ base) {
		return ((base !== null) && ((typeof base) == 'object'));
	};
};


/////////////////////////////////////// end of /Users/buildprocess/HudsonHome/jobs/adfmf-v11-11.1.2.4.1-tip/workspace/Container/JavaScript/ADF/js/MapELResolver.js///////////////////////////////////////



/////////////////////////////////////// start of /Users/buildprocess/HudsonHome/jobs/adfmf-v11-11.1.2.4.1-tip/workspace/Container/JavaScript/ADF/js/AttributeBindingELResolver.js///////////////////////////////////////

// @requires ELErrors
// @requires ArrayELResolver


var adf                    = window.adf                 || {};
adf.mf                     = adf.mf                     || {};
adf.mf.api                 = adf.mf.api                 || {};
adf.mf.el                  = adf.mf.el                  || {};
adf.mf.locale              = adf.mf.locale              || {};
adf.mf.log                 = adf.mf.log                 || {};
adf.mf.resource            = adf.mf.resource            || {};
adf.mf.util                = adf.mf.util                || {};

adf.mf.internal            = adf.mf.internal            || {};
adf.mf.internal.api        = adf.mf.internal.api        || {};
adf.mf.internal.el         = adf.mf.internal.el         || {};
adf.mf.internal.el.parser  = adf.mf.internal.el.parser  || {};
adf.mf.internal.locale     = adf.mf.internal.locale     || {};
adf.mf.internal.log        = adf.mf.internal.log        || {};
adf.mf.internal.mb         = adf.mf.internal.mb         || {};
adf.mf.internal.perf       = adf.mf.internal.perf       || {};
adf.mf.internal.perf.story = adf.mf.internal.perf.story || {};
adf.mf.internal.resource   = adf.mf.internal.resource   || {};
adf.mf.internal.util       = adf.mf.internal.util       || {};


adf.mf.internal.el.Attribute = function(/* AttributeBinding */ ab, /* string */ name)
{
	this['ab']     = ab;
	this['.type']  = 'Attribute';
	this['.name']  = name; 

    this.toString    = function()
    {
    	return "Attribute[" + adf.mf.util.stringify(this.getPropertyInputValue()) + "]";
    };

    this.getProperty = function(/* string */ name)
	{
    	var bindings = undefined;
    	var property = undefined;

    	try
    	{
        	bindings = this.ab.getBindings();
        	property = bindings[this['.name']];
    	}
    	catch(e)
    	{
			throw new adf.mf.PropertyNotFoundException('unknown property ' + this['.name']);
    	}
    	
    	return property[name];
	};
	
	this.getPropertyInputValue  = function()
	{
		if((ab !== undefined) && (ab.tn !== undefined))
		{
			return '' + adf.mf.util.stringify(this.ab.tn.getProvider()[this['.name']]);
		}
		else
		{
			throw new adf.mf.PropertyNotFoundException('unknown property ' + this['.name']);
		}
	};
	
    this.setProperty = function(/* string */ name, /* object */ value)
	{
    	var bindings = this.ab.getBindings();
    	var property = bindings[this['.name']];
    	
    	property[name] = value;
	};
	
	this.setPropertyInputValue  = function(/* object */ value)
	{
		if((ab !== undefined) && (ab.tn !== undefined))
		{
			var p = this.ab.tn.getProvider();

			p[this['.name']] = value;
		}
		else
		{
			throw new adf.mf.PropertyNotFoundException('unknown property ' + this['_name']);
		}
	};
};


/**
 * Defines property resolution behavior on instances of java.util.Map. This resolver handles base
 * objects of type java.util.Map. It accepts any object as a property and uses that object as a key
 * in the map. The resulting value is the value in the map that is associated with that key. This
 * resolver can be constructed in read-only mode, which means that isReadOnly will always return
 * true and {@link #setValue(ELContext, Object, Object, Object)} will always throw
 * PropertyNotWritableException. ELResolvers are combined together using {@link CompositeELResolver}
 * s, to define rich semantics for evaluating an expression. See the javadocs for {@link ELResolver}
 * for details.
 */
adf.mf.internal.el.AttributeELResolver = function(/* boolean */ readonly) {
		this.readOnly = (readonly === undefined)? false : readonly;


	/**
	 * If the base object is a map, returns the most general type that this resolver accepts for the
	 * property argument. Otherwise, returns null. Assuming the base is a Map, this method will
	 * always return Object.class. This is because Maps accept any object as a key.
	 * 
	 * @param context
	 *            The context of this evaluation.
	 * @param base
	 *            The map to analyze. Only bases of type Map are handled by this resolver.
	 * @return null if base is not a Map; otherwise Object.class.
	 */
	/* Type */
	this.getCommonPropertyType = function(/* ELContext */ context, /* object */ base) {
		return this.isResolvable(base) ? (typeof base) : null;
	};
	

	/**
	 * If the base object is a map, returns an Iterator containing the set of keys available in the
	 * Map. Otherwise, returns null. The Iterator returned must contain zero or more instances of
	 * java.beans.FeatureDescriptor. Each info object contains information about a key in the Map,
	 * and is initialized as follows:
	 * <ul>
	 * <li>displayName - The return value of calling the toString method on this key, or "null" if
	 * the key is null</li>
	 * <li>name - Same as displayName property</li>
	 * <li>shortDescription - Empty string</li>
	 * <li>expert - false</li>
	 * <li>hidden - false</li>
	 * <li>preferred - true</li>
	 * </ul>
	 * In addition, the following named attributes must be set in the returned FeatureDescriptors:
	 * <ul>
	 * <li>{@link ELResolver#TYPE} - The return value of calling the getClass() method on this key,
	 * or null if the key is null.</li>
	 * <li>{@link ELResolver#RESOLVABLE_AT_DESIGN_TIME} - true</li>
	 * </ul>
	 * 
	 * @param context
	 *            The context of this evaluation.
	 * @param base
	 *            The map to analyze. Only bases of type Map are handled by this resolver.
	 * @return An Iterator containing zero or more (possibly infinitely more) FeatureDescriptor
	 *         objects, each representing a key in this map, or null if the base object is not a
	 *         map.
	 */
	/* Iterator<FeatureDescriptor> */
	this.getFeatureDescriptors = function(/* ELContext */ context, /* object */base) {
		throw new adf.mf.UnsupportedOperationException("feature descriptions not available");
	};
	

	/**
	 * If the base object is a map, returns the most general acceptable type for a value in this
	 * map. If the base is a Map, the propertyResolved property of the ELContext object must be set
	 * to true by this resolver, before returning. If this property is not true after this method is
	 * called, the caller should ignore the return value. Assuming the base is a Map, this method
	 * will always return Object.class. This is because Maps accept any object as the value for a
	 * given key.
	 * 
	 * @param context
	 *            The context of this evaluation.
	 * @param base
	 *            The map to analyze. Only bases of type Map are handled by this resolver.
	 * @param property
	 *            The key to return the acceptable type for. Ignored by this resolver.
	 * @return If the propertyResolved property of ELContext was set to true, then the most general
	 *         acceptable type; otherwise undefined.
	 * @throws NullPointerException
	 *             if context is null
	 * @throws ELException
	 *             if an exception was thrown while performing the property or variable resolution.
	 *             The thrown exception must be included as the cause property of this exception, if
	 *             available.
	 */
	/* Type */
	this.getType = function(/* ELContext */ context, /* object */ base, /* object */ property) {
		if((context === undefined) || (context === null)) {
			throw new adf.mf.NullPointerException("context is null");
		}
		
		var result = null;
		if (this.isResolvable(base)) {
			context.setPropertyResolved(true);
			result = (typeof base[property]) | 'object';
		}
		return result;
	};
	

	/**
	 * If the base object is a map, returns the value associated with the given key, as specified by
	 * the property argument. If the key was not found, null is returned. If the base is a Map, the
	 * propertyResolved property of the ELContext object must be set to true by this resolver,
	 * before returning. If this property is not true after this method is called, the caller should
	 * ignore the return value. Just as in java.util.Map.get(Object), just because null is returned
	 * doesn't mean there is no mapping for the key; it's also possible that the Map explicitly maps
	 * the key to null.
	 * 
	 * @param context
	 *            The context of this evaluation.
	 * @param base
	 *            The map to analyze. Only bases of type Map are handled by this resolver.
	 * @param property
	 *            The key to return the acceptable type for. Ignored by this resolver.
	 * @return If the propertyResolved property of ELContext was set to true, then the value
	 *         associated with the given key or null if the key was not found. Otherwise, undefined.
	 * @throws ClassCastException
	 *             if the key is of an inappropriate type for this map (optionally thrown by the
	 *             underlying Map).
	 * @throws NullPointerException
	 *             if context is null, or if the key is null and this map does not permit null keys
	 *             (the latter is optionally thrown by the underlying Map).
	 * @throws ELException
	 *             if an exception was thrown while performing the property or variable resolution.
	 *             The thrown exception must be included as the cause property of this exception, if
	 *             available.
	 */
	/* object */
	this.getValue = function(/* ELContext */ context, /* Attribute */ base, /* object */ property) {
		if (context === null) {
			throw new adf.mf.NullPointerException("context is null");
		}
		
		var result = null;
		
		if (this.isResolvable(base)) {
			// adf.mf.internal.perf.trace("adf.mf.internal.el.AttributeELResolver", "getValue: " + property);	
			if(property == "bindings")
			{
				result      = new adf.mf.internal.el.AttributeBinding(base); 
			}
			else if(property == 'inputValue')
			{
				/* getInputValue */
				result = base.getPropertyInputValue(property);
			}
			else
			{
	            result = base.getProperty(property);
			}
			context.setPropertyResolved(result !== undefined);
		}
		return result;
	};
	

	/**
	 * If the base object is a map, returns whether a call to
	 * {@link #setValue(ELContext, Object, Object, Object)} will always fail. If the base is a Map,
	 * the propertyResolved property of the ELContext object must be set to true by this resolver,
	 * before returning. If this property is not true after this method is called, the caller should
	 * ignore the return value. If this resolver was constructed in read-only mode, this method will
	 * always return true. If a Map was created using java.util.Collections.unmodifiableMap(Map),
	 * this method must return true. Unfortunately, there is no Collections API method to detect
	 * this. However, an implementation can create a prototype unmodifiable Map and query its
	 * runtime type to see if it matches the runtime type of the base object as a workaround.
	 * 
	 * @param context
	 *            The context of this evaluation.
	 * @param base
	 *            The map to analyze. Only bases of type Map are handled by this resolver.
	 * @param property
	 *            The key to return the acceptable type for. Ignored by this resolver.
	 * @return If the propertyResolved property of ELContext was set to true, then true if calling
	 *         the setValue method will always fail or false if it is possible that such a call may
	 *         succeed; otherwise undefined.
	 * @throws NullPointerException
	 *             if context is null.
	 * @throws ELException
	 *             if an exception was thrown while performing the property or variable resolution.
	 *             The thrown exception must be included as the cause property of this exception, if
	 *             available.
	 */
	/* boolean */
	this.isReadOnly = function(/* ELContext */ context, /* object */ base, /* object */ property) {
		if (context === null) {
			throw new adf.mf.NullPointerException("context is null");
		}
		if (this.isResolvable(base)) {
			context.setPropertyResolved(true);
		}
		return this.readOnly;
	};
	

	/**
	 * If the base object is a map, attempts to set the value associated with the given key, as
	 * specified by the property argument. If the base is a Map, the propertyResolved property of
	 * the ELContext object must be set to true by this resolver, before returning. If this property
	 * is not true after this method is called, the caller can safely assume no value was set. If
	 * this resolver was constructed in read-only mode, this method will always throw
	 * PropertyNotWritableException. If a Map was created using
	 * java.util.Collections.unmodifiableMap(Map), this method must throw
	 * PropertyNotWritableException. Unfortunately, there is no Collections API method to detect
	 * this. However, an implementation can create a prototype unmodifiable Map and query its
	 * runtime type to see if it matches the runtime type of the base object as a workaround.
	 * 
	 * @param context
	 *            The context of this evaluation.
	 * @param base
	 *            The map to analyze. Only bases of type Map are handled by this resolver.
	 * @param property
	 *            The key to return the acceptable type for. Ignored by this resolver.
	 * @param value
	 *            The value to be associated with the specified key.
	 * @throws ClassCastException
	 *             if the class of the specified key or value prevents it from being stored in this
	 *             map.
	 * @throws NullPointerException
	 *             if context is null, or if this map does not permit null keys or values, and the
	 *             specified key or value is null.
	 * @throws IllegalArgumentException
	 *             if some aspect of this key or value prevents it from being stored in this map.
	 * @throws PropertyNotWritableException
	 *             if this resolver was constructed in read-only mode, or if the put operation is
	 *             not supported by the underlying map.
	 * @throws ELException
	 *             if an exception was thrown while performing the property or variable resolution.
	 *             The thrown exception must be included as the cause property of this exception, if
	 *             available.
	 */
	/* void */
	this.setValue = function(/* ELContext */ context, /* Attribute */ base, /* object */ property, /* object */ value) {
		if (context === null) {
			throw new adf.mf.NullPointerException("context is null");
		}
		if (this.isResolvable(base)) {
			if (this.readOnly) {
				throw new adf.mf.PropertyNotWritableException("resolver is read-only");
			}
			
			if(property == 'inputValue')
			{
				result = base.setPropertyInputValue(value);
			}
			else
			{
				base.setProperty(property, value);
			}
			
			context.setPropertyResolved(true);
		}
	};
	

	/**
	 * Test whether the given base should be resolved by this ELResolver.
	 * 
	 * @param base
	 *            The bean to analyze.
	 * @param property
	 *            The name of the property to analyze. Will be coerced to a String.
	 * @return base is a Property Map
	 */
	/* boolean */ 
	this.isResolvable = function(/* object */ base) {
		return ((base !== null) && ((typeof base) == 'object') && (base['.type'] == 'Attribute'));
	};
};




adf.mf.internal.el.AttributeBinding = function(/* TreeNode */ tn)
{
	this['.type']   = 'AttributeBinding';
	this.tn         = tn;
	
	this.getBindings = function()
	{
		return tn.getBindings();
	};

	this.getProvider = function()
	{
		return tn.getProvider();
	};
	
	this.toString   = function()
	{
		return "Attribute Bindings";
	};
};



/**
 * Defines property resolution behavior on instances of java.util.Map. This resolver handles base
 * objects of type java.util.Map. It accepts any object as a property and uses that object as a key
 * in the map. The resulting value is the value in the map that is associated with that key. This
 * resolver can be constructed in read-only mode, which means that isReadOnly will always return
 * true and {@link #setValue(ELContext, Object, Object, Object)} will always throw
 * PropertyNotWritableException. ELResolvers are combined together using {@link CompositeELResolver}
 * s, to define rich semantics for evaluating an expression. See the javadocs for {@link ELResolver}
 * for details.
 */
adf.mf.internal.el.AttributeBindingELResolver = function(/* boolean */ readonly) {
		this.readOnly = (readonly === undefined)? false : readonly;

	/**
	 * If the base object is a map, returns the most general type that this resolver accepts for the
	 * property argument. Otherwise, returns null. Assuming the base is a Map, this method will
	 * always return Object.class. This is because Maps accept any object as a key.
	 * 
	 * @param context
	 *            The context of this evaluation.
	 * @param base
	 *            The map to analyze. Only bases of type Map are handled by this resolver.
	 * @return null if base is not a Map; otherwise Object.class.
	 */
	/* Type */
	this.getCommonPropertyType = function(/* ELContext */ context, /* object */ base) {
		return this.isResolvable(base) ? (typeof base) : null;
	};
	

	/**
	 * If the base object is a map, returns an Iterator containing the set of keys available in the
	 * Map. Otherwise, returns null. The Iterator returned must contain zero or more instances of
	 * java.beans.FeatureDescriptor. Each info object contains information about a key in the Map,
	 * and is initialized as follows:
	 * <ul>
	 * <li>displayName - The return value of calling the toString method on this key, or "null" if
	 * the key is null</li>
	 * <li>name - Same as displayName property</li>
	 * <li>shortDescription - Empty string</li>
	 * <li>expert - false</li>
	 * <li>hidden - false</li>
	 * <li>preferred - true</li>
	 * </ul>
	 * In addition, the following named attributes must be set in the returned FeatureDescriptors:
	 * <ul>
	 * <li>{@link ELResolver#TYPE} - The return value of calling the getClass() method on this key,
	 * or null if the key is null.</li>
	 * <li>{@link ELResolver#RESOLVABLE_AT_DESIGN_TIME} - true</li>
	 * </ul>
	 * 
	 * @param context
	 *            The context of this evaluation.
	 * @param base
	 *            The map to analyze. Only bases of type Map are handled by this resolver.
	 * @return An Iterator containing zero or more (possibly infinitely more) FeatureDescriptor
	 *         objects, each representing a key in this map, or null if the base object is not a
	 *         map.
	 */
	/* Iterator<FeatureDescriptor> */
	this.getFeatureDescriptors = function(/* ELContext */ context, /* object */base) {
		throw new adf.mf.UnsupportedOperationException("feature descriptions not available");
	};
	

	/**
	 * If the base object is a map, returns the most general acceptable type for a value in this
	 * map. If the base is a Map, the propertyResolved property of the ELContext object must be set
	 * to true by this resolver, before returning. If this property is not true after this method is
	 * called, the caller should ignore the return value. Assuming the base is a Map, this method
	 * will always return Object.class. This is because Maps accept any object as the value for a
	 * given key.
	 * 
	 * @param context
	 *            The context of this evaluation.
	 * @param base
	 *            The map to analyze. Only bases of type Map are handled by this resolver.
	 * @param property
	 *            The key to return the acceptable type for. Ignored by this resolver.
	 * @return If the propertyResolved property of ELContext was set to true, then the most general
	 *         acceptable type; otherwise undefined.
	 * @throws NullPointerException
	 *             if context is null
	 * @throws ELException
	 *             if an exception was thrown while performing the property or variable resolution.
	 *             The thrown exception must be included as the cause property of this exception, if
	 *             available.
	 */
	/* Type */
	this.getType = function(/* ELContext */ context, /* object */ base, /* object */ property) {
		if((context === undefined) || (context === null)) {
			throw new adf.mf.NullPointerException("context is null");
		}
		
		var result = null;
		if (this.isResolvable(base)) {
			context.setPropertyResolved(true);
			result = (typeof base[property]) | 'object';
		}
		return result;
	};
	

	/**
	 * If the base object is a map, returns the value associated with the given key, as specified by
	 * the property argument. If the key was not found, null is returned. If the base is a Map, the
	 * propertyResolved property of the ELContext object must be set to true by this resolver,
	 * before returning. If this property is not true after this method is called, the caller should
	 * ignore the return value. Just as in java.util.Map.get(Object), just because null is returned
	 * doesn't mean there is no mapping for the key; it's also possible that the Map explicitly maps
	 * the key to null.
	 * 
	 * @param context
	 *            The context of this evaluation.
	 * @param base
	 *            The map to analyze. Only bases of type Map are handled by this resolver.
	 * @param property
	 *            The key to return the acceptable type for. Ignored by this resolver.
	 * @return If the propertyResolved property of ELContext was set to true, then the value
	 *         associated with the given key or null if the key was not found. Otherwise, undefined.
	 * @throws ClassCastException
	 *             if the key is of an inappropriate type for this map (optionally thrown by the
	 *             underlying Map).
	 * @throws NullPointerException
	 *             if context is null, or if the key is null and this map does not permit null keys
	 *             (the latter is optionally thrown by the underlying Map).
	 * @throws ELException
	 *             if an exception was thrown while performing the property or variable resolution.
	 *             The thrown exception must be included as the cause property of this exception, if
	 *             available.
	 */
	/* object */
	this.getValue = function(/* ELContext */ context, /* object */ base, /* object */ property) {
		if (context === null) {
			throw new adf.mf.NullPointerException("context is null");
		}

		var result = null;
		
		if (this.isResolvable(base)) {
            result = new adf.mf.internal.el.Attribute(base, property);
			context.setPropertyResolved(result !== undefined);
		}
		return result;
	};
	

	/**
	 * If the base object is a map, returns whether a call to
	 * {@link #setValue(ELContext, Object, Object, Object)} will always fail. If the base is a Map,
	 * the propertyResolved property of the ELContext object must be set to true by this resolver,
	 * before returning. If this property is not true after this method is called, the caller should
	 * ignore the return value. If this resolver was constructed in read-only mode, this method will
	 * always return true. If a Map was created using java.util.Collections.unmodifiableMap(Map),
	 * this method must return true. Unfortunately, there is no Collections API method to detect
	 * this. However, an implementation can create a prototype unmodifiable Map and query its
	 * runtime type to see if it matches the runtime type of the base object as a workaround.
	 * 
	 * @param context
	 *            The context of this evaluation.
	 * @param base
	 *            The map to analyze. Only bases of type Map are handled by this resolver.
	 * @param property
	 *            The key to return the acceptable type for. Ignored by this resolver.
	 * @return If the propertyResolved property of ELContext was set to true, then true if calling
	 *         the setValue method will always fail or false if it is possible that such a call may
	 *         succeed; otherwise undefined.
	 * @throws NullPointerException
	 *             if context is null.
	 * @throws ELException
	 *             if an exception was thrown while performing the property or variable resolution.
	 *             The thrown exception must be included as the cause property of this exception, if
	 *             available.
	 */
	/* boolean */
	this.isReadOnly = function(/* ELContext */ context, /* object */ base, /* object */ property) {
		if (context === null) {
			throw new adf.mf.NullPointerException("context is null");
		}
		if (this.isResolvable(base)) {
			context.setPropertyResolved(true);
		}
		return this.readOnly;
	};
	

	/**
	 * If the base object is a map, attempts to set the value associated with the given key, as
	 * specified by the property argument. If the base is a Map, the propertyResolved property of
	 * the ELContext object must be set to true by this resolver, before returning. If this property
	 * is not true after this method is called, the caller can safely assume no value was set. If
	 * this resolver was constructed in read-only mode, this method will always throw
	 * PropertyNotWritableException. If a Map was created using
	 * java.util.Collections.unmodifiableMap(Map), this method must throw
	 * PropertyNotWritableException. Unfortunately, there is no Collections API method to detect
	 * this. However, an implementation can create a prototype unmodifiable Map and query its
	 * runtime type to see if it matches the runtime type of the base object as a workaround.
	 * 
	 * @param context
	 *            The context of this evaluation.
	 * @param base
	 *            The map to analyze. Only bases of type Map are handled by this resolver.
	 * @param property
	 *            The key to return the acceptable type for. Ignored by this resolver.
	 * @param value
	 *            The value to be associated with the specified key.
	 * @throws ClassCastException
	 *             if the class of the specified key or value prevents it from being stored in this
	 *             map.
	 * @throws NullPointerException
	 *             if context is null, or if this map does not permit null keys or values, and the
	 *             specified key or value is null.
	 * @throws IllegalArgumentException
	 *             if some aspect of this key or value prevents it from being stored in this map.
	 * @throws PropertyNotWritableException
	 *             if this resolver was constructed in read-only mode, or if the put operation is
	 *             not supported by the underlying map.
	 * @throws ELException
	 *             if an exception was thrown while performing the property or variable resolution.
	 *             The thrown exception must be included as the cause property of this exception, if
	 *             available.
	 */
	/* void */
	this.setValue = function(/* ELContext */ context, /* object */ base, /* object */ property, /* object */ value) {
		if (context === null) {
			throw new adf.mf.NullPointerException("context is null");
		}
		if (this.isResolvable(base)) {
			if (this.readOnly) {
				throw new adf.mf.PropertyNotWritableException("resolver is read-only");
			}
			base[property] = value;
			context.setPropertyResolved(true);
		}
	};
	

	/**
	 * Test whether the given base should be resolved by this ELResolver.
	 * 
	 * @param base
	 *            The bean to analyze.
	 * @param property
	 *            The name of the property to analyze. Will be coerced to a String.
	 * @return base is a Property Map
	 */
	/* boolean */ 
	this.isResolvable = function(/* object */ base) {
		return ((base !== null) && ((typeof base) == 'object') && (base['.type'] == 'AttributeBinding'));
	};
};





/////////////////////////////////////// end of /Users/buildprocess/HudsonHome/jobs/adfmf-v11-11.1.2.4.1-tip/workspace/Container/JavaScript/ADF/js/AttributeBindingELResolver.js///////////////////////////////////////



/////////////////////////////////////// start of /Users/buildprocess/HudsonHome/jobs/adfmf-v11-11.1.2.4.1-tip/workspace/Container/JavaScript/ADF/js/CompositeELResolver.js///////////////////////////////////////

// @requires ELErrors
// @requires ArrayELResolver
// @requires MapELResolver


var adf                    = window.adf                 || {};
adf.mf                     = adf.mf                     || {};
adf.mf.api                 = adf.mf.api                 || {};
adf.mf.el                  = adf.mf.el                  || {};
adf.mf.locale              = adf.mf.locale              || {};
adf.mf.log                 = adf.mf.log                 || {};
adf.mf.resource            = adf.mf.resource            || {};
adf.mf.util                = adf.mf.util                || {};

adf.mf.internal            = adf.mf.internal            || {};
adf.mf.internal.api        = adf.mf.internal.api        || {};
adf.mf.internal.el         = adf.mf.internal.el         || {};
adf.mf.internal.el.parser  = adf.mf.internal.el.parser  || {};
adf.mf.internal.locale     = adf.mf.internal.locale     || {};
adf.mf.internal.log        = adf.mf.internal.log        || {};
adf.mf.internal.mb         = adf.mf.internal.mb         || {};
adf.mf.internal.perf       = adf.mf.internal.perf       || {};
adf.mf.internal.perf.story = adf.mf.internal.perf.story || {};
adf.mf.internal.resource   = adf.mf.internal.resource   || {};
adf.mf.internal.util       = adf.mf.internal.util       || {};

/**
 * Maintains an ordered composite list of child ELResolvers. Though only a single ELResolver is
 * associated with an ELContext, there are usually multiple resolvers considered for any given
 * variable or property resolution. ELResolvers are combined together using a CompositeELResolver,
 * to define rich semantics for evaluating an expression. For the
 * {@link #getValue(ELContext, object, object)}, {@link #getType(ELContext, object, object)},
 * {@link #setValue(ELContext, object, object, object)} and
 * {@link #isReadOnly(ELContext, object, object)} methods, an ELResolver is not responsible for
 * resolving all possible (base, property) pairs. In fact, most resolvers will only handle a base of
 * a single type. To indicate that a resolver has successfully resolved a particular (base,
 * property) pair, it must set the propertyResolved property of the ELContext to true. If it could
 * not handle the given pair, it must leave this property alone. The caller must ignore the return
 * value of the method if propertyResolved is false. The CompositeELResolver initializes the
 * ELContext.propertyResolved flag to false, and uses it as a stop condition for iterating through
 * its component resolvers. The ELContext.propertyResolved flag is not used for the design-time
 * methods {@link #getFeatureDescriptors(ELContext, object)} and
 * {@link #getCommonPropertyType(ELContext, object)}. Instead, results are collected and combined
 * from all child ELResolvers for these methods.
 */
adf.mf.internal.el.CompositeELResolver = function() { /* ELResolver, */
	this.resolvers = [];
	

	/**
	 * Adds the given resolver to the list of component resolvers. Resolvers are consulted in the
	 * order in which they are added.
	 * 
	 * @param elResolver
	 *            The component resolver to add.
	 * @throws NullPointerException
	 *             If the provided resolver is null.
	 */
	/* void */
	this.add = function(/* ELResolver */ elResolver) {
		if (elResolver === null) {
			throw new Error("resolver can not be null");
		}
		elResolver.temporary = false;
		this.resolvers.push(elResolver);
	};
	
	
	/**
	 * RegisterELResolver is the same as add for the temporary resolvers.
	 */
	this.registerELResolver = function(/* ELResolver */ elResolver) {
		if (elResolver === null) {
			throw new Error("resolver can not be null");
		}
		elResolver.temporary = true;
		this.resolvers.push(elResolver);
	};
	
	
	/**
	 * Unregisters an EL resolver from the list of temporary resolvers.
	 */
	this.unregisterELResolver = function(/* ELResolver */ elResolver) {
		if (elResolver === null) {
			throw new Error("resolver can not be null");
		}
		
		for(var i = 0; i < this.resolvers.length; ++i) {
			if(this.resolvers[i] === elResolver) {
				if(this.resolvers[i].temporary) {
					this.resolvers.splice(i, i+1);
				} else {
					throw new Error("can not remove a non-temporary resolver.");
				}
			}
		}
	};
	

	/**
	 * Returns the most general type that this resolver accepts for the property argument, given a
	 * base object. One use for this method is to assist tools in auto-completion. The result is
	 * obtained by querying all component resolvers. The Class returned is the most specific class
	 * that is a common superclass of all the classes returned by each component resolver's
	 * getCommonPropertyType method. If null is returned by a resolver, it is skipped.
	 * 
	 * @param context
	 *            The context of this evaluation.
	 * @param base
	 *            The base object to return the most general property type for, or null to enumerate
	 *            the set of top-level variables that this resolver can evaluate.
	 * @return null if this ELResolver does not know how to handle the given base object; otherwise
	 *         object.class if any type of property is accepted; otherwise the most general property
	 *         type accepted for the given base.
	 */
	/* Type */
	this.getCommonPropertyType = function(/* ELContext */ context, /* object */ base) {
		var type = null;
		
		for (var r = 0; r < this.resolvers.length; ++r) {
			if(this.resolvers[r] !== null) {
				type = this.resolvers[r].getCommonPropertyType(context, base);

				if ((context.isPropertyResolved()) && (type !== null)) {
					break;
				}
			}
		}
		return type;
	};
	

	/**
	 * Returns information about the set of variables or properties that can be resolved for the
	 * given base object. One use for this method is to assist tools in auto-completion. The results
	 * are collected from all component resolvers. The propertyResolved property of the ELContext is
	 * not relevant to this method. The results of all ELResolvers are concatenated. The Iterator
	 * returned is an iterator over the collection of FeatureDescriptor objects returned by the
	 * iterators returned by each component resolver's getFeatureDescriptors method. If null is
	 * returned by a resolver, it is skipped.
	 * 
	 * @param context
	 *            The context of this evaluation.
	 * @param base
	 *            The base object to return the most general property type for, or null to enumerate
	 *            the set of top-level variables that this resolver can evaluate.
	 * @return An Iterator containing zero or more (possibly infinitely more) FeatureDescriptor
	 *         objects, or null if this resolver does not handle the given base object or that the
	 *         results are too complex to represent with this method
	 */
	/* Iterator<FeatureDescriptor> */
	this.getFeatureDescriptors = function(/* final ELContext */ context, /* final object */ base) {
		throw new adf.mf.UnsupportedOperation("UnsupportedOperationException - getCommonPropertyType");
	};
	

	/**
	 * For a given base and property, attempts to identify the most general type that is acceptable
	 * for an object to be passed as the value parameter in a future call to the
	 * {@link #setValue(ELContext, object, object, object)} method. The result is obtained by
	 * querying all component resolvers. If this resolver handles the given (base, property) pair,
	 * the propertyResolved property of the ELContext object must be set to true by the resolver,
	 * before returning. If this property is not true after this method is called, the caller should
	 * ignore the return value. First, propertyResolved is set to false on the provided ELContext.
	 * Next, for each component resolver in this composite:
	 * <ol>
	 * <li>The getType() method is called, passing in the provided context, base and property.</li>
	 * <li>If the ELContext's propertyResolved flag is false then iteration continues.</li>
	 * <li>Otherwise, iteration stops and no more component resolvers are considered. The value
	 * returned by getType() is returned by this method.</li>
	 * </ol>
	 * If none of the component resolvers were able to perform this operation, the value null is
	 * returned and the propertyResolved flag remains set to false. Any exception thrown by
	 * component resolvers during the iteration is propagated to the caller of this method.
	 * 
	 * @param context
	 *            The context of this evaluation.
	 * @param base
	 *            The base object to return the most general property type for, or null to enumerate
	 *            the set of top-level variables that this resolver can evaluate.
	 * @param property
	 *            The property or variable to return the acceptable type for.
	 * @return If the propertyResolved property of ELContext was set to true, then the most general
	 *         acceptable type; otherwise undefined.
	 * @throws NullPointerException
	 *             if context is null
	 * @throws PropertyNotFoundException
	 *             if base is not null and the specified property does not exist or is not readable.
	 * @throws ELException
	 *             if an exception was thrown while performing the property or variable resolution.
	 *             The thrown exception must be included as the cause property of this exception, if
	 *             available.
	 */
	/* Type */
	this.getType = function(/* ELContext */ context, /* object */ base, /* object */ property) {
		var type = null;
		
		context.setPropertyResolved(false);

		for (var r = 0; r < this.resolvers.length; ++r) {
			if(this.resolvers[r] !== null) {
				type = this.resolvers[r].getType(context, base, property);
				
				if (context.isPropertyResolved()) {
					break;
				}
			}
		}
		return type;
	};
	

	/**
	 * Attempts to resolve the given property object on the given base object by querying all
	 * component resolvers. If this resolver handles the given (base, property) pair, the
	 * propertyResolved property of the ELContext object must be set to true by the resolver, before
	 * returning. If this property is not true after this method is called, the caller should ignore
	 * the return value. First, propertyResolved is set to false on the provided ELContext. Next,
	 * for each component resolver in this composite:
	 * <ol>
	 * <li>The getValue() method is called, passing in the provided context, base and property.</li>
	 * <li>If the ELContext's propertyResolved flag is false then iteration continues.</li>
	 * <li>Otherwise, iteration stops and no more component resolvers are considered. The value
	 * returned by getValue() is returned by this method.</li>
	 * </ol>
	 * If none of the component resolvers were able to perform this operation, the value null is
	 * returned and the propertyResolved flag remains set to false. Any exception thrown by
	 * component resolvers during the iteration is propagated to the caller of this method.
	 * 
	 * @param context
	 *            The context of this evaluation.
	 * @param base
	 *            The base object to return the most general property type for, or null to enumerate
	 *            the set of top-level variables that this resolver can evaluate.
	 * @param property
	 *            The property or variable to return the acceptable type for.
	 * @return If the propertyResolved property of ELContext was set to true, then the result of the
	 *         variable or property resolution; otherwise undefined.
	 * @throws NullPointerException
	 *             if context is null
	 * @throws PropertyNotFoundException
	 *             if base is not null and the specified property does not exist or is not readable.
	 * @throws ELException
	 *             if an exception was thrown while performing the property or variable resolution.
	 *             The thrown exception must be included as the cause property of this exception, if
	 *             available.
	 */
	/* object */
	this.getValue = function(/* ELContext */ context, /* object */ base, /* object */ property) {
		var  value = null;
		
		context.setPropertyResolved(false);
		for (var r = 0; r < this.resolvers.length; ++r) {
			if(this.resolvers[r] !== null) {
				value = this.resolvers[r].getValue(context, base, property);
				
				if (context.isPropertyResolved()) {
					break;
				}
			}
		}
//		if(adf.mf.log.Performance.isLoggable(adf.mf.log.level.FINE))
//		{
//			adf.mf.internal.perf.trace("adf.mf.internal.el.CompositeELResolver", "getValue: " + 
//	                                    property + " found: " + context.isPropertyResolved());	
//		}
		
		if(! context.isPropertyResolved()) {
			throw new adf.mf.PropertyNotFoundException();
		}
		return value;
	};
	

	/**
	 * For a given base and property, attempts to determine whether a call to
	 * {@link #setValue(ELContext, object, object, object)} will always fail. The result is obtained
	 * by querying all component resolvers. If this resolver handles the given (base, property)
	 * pair, the propertyResolved property of the ELContext object must be set to true by the
	 * resolver, before returning. If this property is not true after this method is called, the
	 * caller should ignore the return value. First, propertyResolved is set to false on the
	 * provided ELContext. Next, for each component resolver in this composite:
	 * <ol>
	 * <li>The isReadOnly() method is called, passing in the provided context, base and property.</li>
	 * <li>If the ELContext's propertyResolved flag is false then iteration continues.</li>
	 * <li>Otherwise, iteration stops and no more component resolvers are considered. The value
	 * returned by isReadOnly() is returned by this method.</li>
	 * </ol>
	 * If none of the component resolvers were able to perform this operation, the value false is
	 * returned and the propertyResolved flag remains set to false. Any exception thrown by
	 * component resolvers during the iteration is propagated to the caller of this method.
	 * 
	 * @param context
	 *            The context of this evaluation.
	 * @param base
	 *            The base object to return the most general property type for, or null to enumerate
	 *            the set of top-level variables that this resolver can evaluate.
	 * @param property
	 *            The property or variable to return the acceptable type for.
	 * @return If the propertyResolved property of ELContext was set to true, then true if the
	 *         property is read-only or false if not; otherwise undefined.
	 * @throws NullPointerException
	 *             if context is null
	 * @throws PropertyNotFoundException
	 *             if base is not null and the specified property does not exist or is not readable.
	 * @throws ELException
	 *             if an exception was thrown while performing the property or variable resolution.
	 *             The thrown exception must be included as the cause property of this exception, if
	 *             available.
	 */
	/* boolean */
	this.isReadOnly = function(/* ELContext */ context, /* object */ base, /* object */ property) {
		var readOnly = null;

		context.setPropertyResolved(false);
		for (var r = 0; r < this.resolvers.length; ++r) {
			if(this.resolvers[r] !== null) {
				readOnly = this.resolvers[r].isReadOnly(context, base, property);
				
				if (context.isPropertyResolved()) {
					break;
				}
			}
		}
		return readOnly;
	};
	

	/**
	 * Attempts to set the value of the given property object on the given base object. All
	 * component resolvers are asked to attempt to set the value. If this resolver handles the given
	 * (base, property) pair, the propertyResolved property of the ELContext object must be set to
	 * true by the resolver, before returning. If this property is not true after this method is
	 * called, the caller can safely assume no value has been set. First, propertyResolved is set to
	 * false on the provided ELContext. Next, for each component resolver in this composite:
	 * <ol>
	 * <li>The setValue() method is called, passing in the provided context, base, property and
	 * value.</li>
	 * <li>If the ELContext's propertyResolved flag is false then iteration continues.</li>
	 * <li>Otherwise, iteration stops and no more component resolvers are considered.</li>
	 * </ol>
	 * If none of the component resolvers were able to perform this operation, the propertyResolved
	 * flag remains set to false. Any exception thrown by component resolvers during the iteration
	 * is propagated to the caller of this method.
	 * 
	 * @param context
	 *            The context of this evaluation.
	 * @param base
	 *            The base object to return the most general property type for, or null to enumerate
	 *            the set of top-level variables that this resolver can evaluate.
	 * @param property
	 *            The property or variable to return the acceptable type for.
	 * @param value
	 *            The value to set the property or variable to.
	 * @throws NullPointerException
	 *             if context is null
	 * @throws PropertyNotFoundException
	 *             if base is not null and the specified property does not exist or is not readable.
	 * @throws PropertyNotWritableException
	 *             if the given (base, property) pair is handled by this ELResolver but the
	 *             specified variable or property is not writable.
	 * @throws ELException
	 *             if an exception was thrown while attempting to set the property or variable. The
	 *             thrown exception must be included as the cause property of this exception, if
	 *             available.
	 */
	/* void */
	this.setValue = function(/* ELContext */ context, /* object */ base, /* object */ property, /* object */ value) {
		context.setPropertyResolved(false);

		for (var r = 0; r < this.resolvers.length; ++r) {
			if(this.resolvers[r] !== null) {
				this.resolvers[r].setValue(context, base, property, value);
				
				if (context.isPropertyResolved()) {
					break;
				}
			}
		}
	};
	

	/**
	 * Attempts to resolve and invoke the given <code>method</code> on the given <code>base</code>
	 * object by querying all component resolvers.
	 * 
	 * <p>
	 * If this resolver handles the given (base, method) pair, the <code>propertyResolved</code>
	 * property of the <code>ELContext</code> object must be set to <code>true</code> by the
	 * resolver, before returning. If this property is not <code>true</code> after this method is
	 * called, the caller should ignore the return value.
	 * </p>
	 * 
	 * <p>
	 * First, <code>propertyResolved</code> is set to <code>false</code> on the provided
	 * <code>ELContext</code>.
	 * </p>
	 * 
	 * <p>
	 * Next, for each component resolver in this composite:
	 * <ol>
	 * <li>The <code>invoke()</code> method is called, passing in the provided <code>context</code>,
	 * <code>base</code>, <code>method</code>, <code>paramTypes</code>, and <code>params</code>.</li>
	 * <li>If the <code>ELContext</code>'s <code>propertyResolved</code> flag is <code>false</code>
	 * then iteration continues.</li>
	 * <li>Otherwise, iteration stops and no more component resolvers are considered. The value
	 * returned by <code>getValue()</code> is returned by this method.</li>
	 * </ol>
	 * </p>
	 * 
	 * <p>
	 * If none of the component resolvers were able to perform this operation, the value
	 * <code>null</code> is returned and the <code>propertyResolved</code> flag remains set to
	 * <code>false</code>
	 * </p>
	 * 
	 * <p>
	 * Any exception thrown by component resolvers during the iteration is propagated to the caller
	 * of this method.
	 * </p>
	 * 
	 * @param context
	 *            The context of this evaluation.
	 * @param base
	 *            The bean on which to invoke the method
	 * @param method
	 *            The simple name of the method to invoke. Will be coerced to a <code>String</code>.
	 *            If method is "&lt;init&gt;"or "&lt;clinit&gt;" a NoSuchMethodException is raised.
	 * @param paramTypes
	 *            An array of Class objects identifying the method's formal parameter types, in
	 *            declared order. Use an empty array if the method has no parameters. Can be
	 *            <code>null</code>, in which case the method's formal parameter types are assumed
	 *            to be unknown.
	 * @param params
	 *            The parameters to pass to the method, or <code>null</code> if no parameters.
	 * @return The result of the method invocation (<code>null</code> if the method has a
	 *         <code>void</code> return type).
	 * @since 2.2
	 */
	/* object */
	this.invoke = function(/* ELContext */ context, /* object */ base, /* object */ method, /* Type[] */ paramTypes, /* object[] */ params) {
		var result = null;

		context.setPropertyResolved(false);

		for (var r = 0; r < this.resolvers.length; ++r) {
			if(this.resolvers[r] !== null) {
				result = this.resolvers[r].invoke(context, base, method, paramTypes, params);
				
				if (context.isPropertyResolved()) {
					break;
				}
			}
		}
		return result;
	};
};


/////////////////////////////////////// end of /Users/buildprocess/HudsonHome/jobs/adfmf-v11-11.1.2.4.1-tip/workspace/Container/JavaScript/ADF/js/CompositeELResolver.js///////////////////////////////////////



/////////////////////////////////////// start of /Users/buildprocess/HudsonHome/jobs/adfmf-v11-11.1.2.4.1-tip/workspace/Container/JavaScript/ADF/js/JavaScriptExpressionFactory.js///////////////////////////////////////

// @requires ELErrors
// @requires ArrayELResolver
// @requires MapELResolver
// @requires CompositeELResolver


var adf                    = window.adf                 || {};
adf.mf                     = adf.mf                     || {};
adf.mf.api                 = adf.mf.api                 || {};
adf.mf.el                  = adf.mf.el                  || {};
adf.mf.locale              = adf.mf.locale              || {};
adf.mf.log                 = adf.mf.log                 || {};
adf.mf.resource            = adf.mf.resource            || {};
adf.mf.util                = adf.mf.util                || {};

adf.mf.internal            = adf.mf.internal            || {};
adf.mf.internal.api        = adf.mf.internal.api        || {};
adf.mf.internal.el         = adf.mf.internal.el         || {};
adf.mf.internal.el.parser  = adf.mf.internal.el.parser  || {};
adf.mf.internal.locale     = adf.mf.internal.locale     || {};
adf.mf.internal.log        = adf.mf.internal.log        || {};
adf.mf.internal.mb         = adf.mf.internal.mb         || {};
adf.mf.internal.perf       = adf.mf.internal.perf       || {};
adf.mf.internal.perf.story = adf.mf.internal.perf.story || {};
adf.mf.internal.resource   = adf.mf.internal.resource   || {};
adf.mf.internal.util       = adf.mf.internal.util       || {};

/**
 * Parses a String into a {@link ValueExpression} or {@link MethodExpression} instance for later
 * evaluation. Classes that implement the EL expression language expose their functionality via this
 * abstract class. There is no concrete implementation of this API available in this package.
 * Technologies such as JavaServer Pages and JavaServer Faces provide access to an implementation
 * via factory methods. The {@link #createValueExpression(ELContext, String, Class)} method is used
 * to parse expressions that evaluate to values (both l-values and r-values are supported). The
 * {@link #createMethodExpression(ELContext, String, Class, Class[])} method is used to parse
 * expressions that evaluate to a reference to a method on an object. Unlike previous incarnations
 * of this API, there is no way to parse and evaluate an expression in one single step. The
 * expression needs to first be parsed, and then evaluated. Resolution of model objects is performed
 * at evaluation time, via the {@link ELResolver} associated with the {@link ELContext} passed to
 * the ValueExpression or MethodExpression. The ELContext object also provides access to the
 * {@link FunctionMapper} and {@link VariableMapper} to be used when parsing the expression. EL
 * function and variable mapping is performed at parse-time, and the results are bound to the
 * expression. Therefore, the {@link ELContext}, {@link FunctionMapper}, and {@link VariableMapper}
 * are not stored for future use and do not have to be Serializable. The createValueExpression and
 * createMethodExpression methods must be thread-safe. That is, multiple threads may call these
 * methods on the same ExpressionFactory object simultaneously. Implementations should synchronize
 * access if they depend on transient state. Implementations should not, however, assume that only
 * one object of each ExpressionFactory type will be instantiated; global caching should therefore
 * be static. The ExpressionFactory must be able to handle the following types of input for the
 * expression parameter:
 * <ul>
 * <li>Single expressions using the ${} delimiter (e.g. "${employee.lastName}").</li>
 * <li>Single expressions using the #{} delimiter (e.g. "#{employee.lastName}").</li>
 * <li>Literal text containing no ${} or #{} delimiters (e.g. "John Doe").</li>
 * <li>Multiple expressions using the same delimiter (e.g.</li>
 * "${employee.firstName}${employee.lastName}" or "#{employee.firstName}#{employee.lastName}").
 * <li>Mixed literal text and expressions using the same delimiter (e.g. "Name:
 * ${employee.firstName} ${employee.lastName}").</li>
 * </ul>
 * The following types of input are illegal and must cause an {@link ELException} to be thrown:
 * <ul>
 * <li>Multiple expressions using different delimiters (e.g.
 * "${employee.firstName}#{employee.lastName}").</li>
 * <li>Mixed literal text and expressions using different delimiters(e.g. "Name:
 * ${employee.firstName} #{employee.lastName}").</li>
 * </ul>
 */
adf.mf.el.JavaScriptExpressionFactory = function(/* Properties */ properties)  {
	this.properties  = properties;
	
	/**
	 * Coerces an object to a specific type according to the EL type conversion rules. An
	 * {@link ELException} is thrown if an error results from applying the conversion rules.
	 * 
	 * @param obj
	 *            The object to coerce.
	 * @param targetType
	 *            The target type for the coercion.
	 * @return the coerced object
	 * @throws ELException
	 *             if an error results from applying the conversion rules.
	 */
	/* Object */
	this.coerceToType = function(/* Object */ obj, /* Type */ targetType) {
		return obj;
	};
	

	/**
	 * Parses an expression into a {@link MethodExpression} for later evaluation. Use this method
	 * for expressions that refer to methods. If the expression is a String literal, a
	 * MethodExpression is created, which when invoked, returns the String literal, coerced to
	 * expectedReturnType. An ELException is thrown if expectedReturnType is void or if the coercion
	 * of the String literal to the expectedReturnType yields an error (see Section "1.16 Type
	 * Conversion"). This method should perform syntactic validation of the expression. If in doing
	 * so it detects errors, it should raise an ELException.
	 * 
	 * @param context
	 *            The EL context used to parse the expression. The FunctionMapper and VariableMapper
	 *            stored in the ELContext are used to resolve functions and variables found in the
	 *            expression. They can be null, in which case functions or variables are not
	 *            supported for this expression. The object returned must invoke the same functions
	 *            and access the same variable mappings regardless of whether the mappings in the
	 *            provided FunctionMapper and VariableMapper instances change between calling
	 *            ExpressionFactory.createMethodExpression() and any method on MethodExpression.
	 *            Note that within the EL, the ${} and #{} syntaxes are treated identically. This
	 *            includes the use of VariableMapper and FunctionMapper at expression creation time.
	 *            Each is invoked if not null, independent of whether the #{} or ${} syntax is used
	 *            for the expression.
	 * @param expression
	 *            The expression to parse
	 * @param expectedReturnType
	 *            The expected return type for the method to be found. After evaluating the
	 *            expression, the MethodExpression must check that the return type of the actual
	 *            method matches this type. Passing in a value of null indicates the caller does not
	 *            care what the return type is, and the check is disabled.
	 * @param expectedParamTypes
	 *            The expected parameter types for the method to be found. Must be an array with no
	 *            elements if there are no parameters expected. It is illegal to pass null, unless
	 *            the method is specified with arguments in the EL expression.
	 * @return The parsed expression
	 * @throws ELException
	 *             Thrown if there are syntactical errors in the provided expression.
	 * @throws NullPointerException
	 *             if paramTypes is null.
	 */
	/* MethodExpression */
	this.createMethodExpression = function(/* ELContext */ context,            /* String */ expression,
			                               /* Type      */ expectedReturnType, /* Type[] */ expectedParamTypes) {
		return null;
	};
	

	/**
	 * Parses an expression into a {@link ValueExpression} for later evaluation. Use this method for
	 * expressions that refer to values. This method should perform syntactic validation of the
	 * expression. If in doing so it detects errors, it should raise an ELException.
	 * 
	 * @param context
	 *            The EL context used to parse the expression. The FunctionMapper and VariableMapper
	 *            stored in the ELContext are used to resolve functions and variables found in the
	 *            expression. They can be null, in which case functions or variables are not
	 *            supported for this expression. The object returned must invoke the same functions
	 *            and access the same variable mappings regardless of whether the mappings in the
	 *            provided FunctionMapper and VariableMapper instances change between calling
	 *            ExpressionFactory.createValueExpression() and any method on ValueExpression. Note
	 *            that within the EL, the ${} and #{} syntaxes are treated identically. This
	 *            includes the use of VariableMapper and FunctionMapper at expression creation time.
	 *            Each is invoked if not null, independent of whether the #{} or ${} syntax is used
	 *            for the expression.
	 * @param expression
	 *            The expression to parse
	 * @param expectedType
	 *            The type the result of the expression will be coerced to after evaluation.
	 * @return The parsed expression
	 * @throws ELException
	 *             Thrown if there are syntactical errors in the provided expression.
	 * @throws NullPointerException
	 *             if paramTypes is null.
	 */
	/* adf.mf.el.ValueExpression */
	this.createValueExpression = function(/* ELContext */ context, /* String */ expression, /* Type */ expectedType) {
		var elExpression = adf.mf.internal.el.parser.parse((expression   !== undefined)? expression   : " ");
		return new adf.mf.el.ValueExpression(context, elExpression, expectedType);
	};
	

	/**
	 * Creates a ValueExpression that wraps an object instance. This method can be used to pass any
	 * object as a ValueExpression. The wrapper ValueExpression is read only, and returns the
	 * wrapped object via its getValue() method, optionally coerced.
	 * 
	 * @param instance
	 *            The object instance to be wrapped.
	 * @param expectedType
	 *            The type the result of the expression will be coerced to after evaluation. There
	 *            will be no coercion if it is Object.class,
	 * @return a ValueExpression that wraps the given object instance.
	 */
	/* adf.mf.el.ValueExpression */
	this.createObjectExpression = function(/* Object */ instance, /* Type */ expectedType) {
		return null;
	};
};


/////////////////////////////////////// end of /Users/buildprocess/HudsonHome/jobs/adfmf-v11-11.1.2.4.1-tip/workspace/Container/JavaScript/ADF/js/JavaScriptExpressionFactory.js///////////////////////////////////////



/////////////////////////////////////// start of /Users/buildprocess/HudsonHome/jobs/adfmf-v11-11.1.2.4.1-tip/workspace/Container/JavaScript/ADF/js/ValueExpression.js///////////////////////////////////////

// @requires ELErrors
// @requires ArrayELResolver
// @requires MapELResolver
// @requires CompositeELResolver
// @requires JavaScriptExpressionFactory


var adf                    = window.adf                 || {};
adf.mf                     = adf.mf                     || {};
adf.mf.api                 = adf.mf.api                 || {};
adf.mf.el                  = adf.mf.el                  || {};
adf.mf.locale              = adf.mf.locale              || {};
adf.mf.log                 = adf.mf.log                 || {};
adf.mf.resource            = adf.mf.resource            || {};
adf.mf.util                = adf.mf.util                || {};

adf.mf.internal            = adf.mf.internal            || {};
adf.mf.internal.api        = adf.mf.internal.api        || {};
adf.mf.internal.el         = adf.mf.internal.el         || {};
adf.mf.internal.el.parser  = adf.mf.internal.el.parser  || {};
adf.mf.internal.locale     = adf.mf.internal.locale     || {};
adf.mf.internal.log        = adf.mf.internal.log        || {};
adf.mf.internal.mb         = adf.mf.internal.mb         || {};
adf.mf.internal.perf       = adf.mf.internal.perf       || {};
adf.mf.internal.perf.story = adf.mf.internal.perf.story || {};
adf.mf.internal.resource   = adf.mf.internal.resource   || {};
adf.mf.internal.util       = adf.mf.internal.util       || {};

/**
 * An Expression that can get or set a value.
 * <p>
 * In previous incarnations of this API, expressions could only be read. ValueExpression objects can
 * now be used both to retrieve a value and to set a value. Expressions that can have a value set on
 * them are referred to as l-value expressions. Those that cannot are referred to as r-value
 * expressions. Not all r-value expressions can be used as l-value expressions (e.g. "${1+1}" or
 * "${firstName} ${lastName}"). See the EL Specification for details. Expressions that cannot be
 * used as l-values must always return true from isReadOnly().
 * </p>
 * <p>
 * The {@link ExpressionFactory#createValueExpression(ELContext, String, Class)} method can be used
 * to parse an expression string and return a concrete instance of ValueExpression that encapsulates
 * the parsed expression. The {@link FunctionMapper} is used at parse time, not evaluation time, so
 * one is not needed to evaluate an expression using this class. However, the {@link ELContext} is
 * needed at evaluation time.
 * </p>
 * <p>
 * The {@link #getValue(ELContext)}, {@link #setValue(ELContext, Object)},
 * {@link #isReadOnly(ELContext)}, {@link #getType(ELContext)} and
 * {@link #getValueReference(ELContext, boolean)} methods will evaluate the expression each time they are
 * called. The {@link ELResolver} in the ELContext is used to resolve the top-level variables and to
 * determine the behavior of the . and [] operators. For any of the five methods, the
 * {@link ELResolver#getValue(ELContext, Object, Object)} method is used to resolve all properties
 * up to but excluding the last one. This provides the base object. For all methods other than the
 * {@link #getValueReference(ELContext, boolean)} method, at the last resolution, the ValueExpression will
 * call the corresponding {@link ELResolver#getValue(ELContext, Object, Object)},
 * {@link ELResolver#setValue(ELContext, Object, Object, Object)},
 * {@link ELResolver#isReadOnly(ELContext, Object, Object)} or
 * {@link ELResolver#getType(ELContext, Object, Object)} method, depending on which was called on
 * the ValueExpression. For the {@link #getValueReference(ELContext, boolean)} method, the (base, property)
 * is not resolved by the ELResolver, but an instance of {@link ValueReference} is created to
 * encapsulate this (base, property), and returned.
 * </p>
 * <p>
 * See the notes about comparison, serialization and immutability in the {@link Expression}
 * javadocs.
 * </p>
 * 
 * @see ELResolver
 * @see Expression
 * @see ExpressionFactory
 */
/* public interface */
adf.mf.el.ValueExpression = function(/* ELContext */ context, /* String */ expression, /* Type */ expectedType) {
	this.context        = (context      !== undefined)? context      : new JavaScriptContext();
	this.expression     = (expression   !== undefined)? expression   : null;
	this.expectedType   = (expectedType !== undefined)? expectedType : 'object';	
	
	/**
	 * Returns the type the result of the expression will be coerced to after evaluation.
	 * 
	 * @return the expectedType passed to the ExpressionFactory.createValueExpression method that
	 *         created this ValueExpression.
	 */
	/* Type */
	this.getExpectedType = function() {
		return this.expectedType;
	};
	

	/**
	 * Evaluates the expression relative to the provided context, and returns the most general type
	 * that is acceptable for an object to be passed as the value parameter in a future call to the
	 * {@link #setValue(ELContext, Object)} method. This is not always the same as
	 * getValue().getClass(). For example, in the case of an expression that references an array
	 * element, the getType method will return the element type of the array, which might be a
	 * superclass of the type of the actual element that is currently in the specified array
	 * element.
	 * 
	 * @param context
	 *            The context of this evaluation.
	 * @return the most general acceptable type; otherwise undefined.
	 * @throws NullPointerException
	 *             if context is null.
	 * @throws PropertyNotFoundException
	 *             if one of the property resolutions failed because a specified variable or
	 *             property does not exist or is not readable.
	 * @throws ELException
	 *             if an exception was thrown while performing property or variable resolution. The
	 *             thrown exception must be included as the cause property of this exception, if
	 *             available.
	 */
	/* Type */
	this.getType = function(/* ELContext */ context) {
		return (typeof this.getValue(context));
	};
	

	/**
	 * Evaluates the expression relative to the provided context, and returns the resulting value.
	 * The resulting value is automatically coerced to the type returned by getExpectedType(), which
	 * was provided to the ExpressionFactory when this expression was created.
	 * 
	 * @param context
	 *            The context of this evaluation.
	 * @return The result of the expression evaluation.
	 * @throws NullPointerException
	 *             if context is null.
	 * @throws PropertyNotFoundException
	 *             if one of the property resolutions failed because a specified variable or
	 *             property does not exist or is not readable.
	 * @throws ELException
	 *             if an exception was thrown while performing property or variable resolution. The
	 *             thrown exception must be included as the cause property of this exception, if
	 *             available.
	 */
	/* object */ 
    this.getValue = function(/* ELContext */ context) 
    {
    	return (expression === null)? null : expression.evaluate(context);
    };


	/**
	 * Evaluates the expression relative to the provided context, and returns true if a call to
	 * {@link #setValue(ELContext, Object)} will always fail.
	 * 
	 * @param context
	 *            The context of this evaluation.
	 * @return true if the expression is read-only or false if not.
	 * @throws NullPointerException
	 *             if context is null.
	 * @throws PropertyNotFoundException
	 *             if one of the property resolutions failed because a specified variable or
	 *             property does not exist or is not readable.
	 * @throws ELException
	 *             if an exception was thrown while performing property or variable resolution. The
	 *             thrown exception must be included as the cause property of this exception, if
	 *             available.
	 */
	/* boolean */
	this.isReadOnly = function(/* ELContext */ context) {
		return (expression === null)? true : expression.isReadOnly();
	};
	

	/**
	 * Evaluates the expression relative to the provided context, and sets the result to the
	 * provided value.
	 * 
	 * @param context
	 *            The context of this evaluation.
	 * @param value
	 *            The new value to be set.
	 * @throws NullPointerException
	 *             if context is null.
	 * @throws PropertyNotFoundException
	 *             if one of the property resolutions failed because a specified variable or
	 *             property does not exist or is not readable.
	 * @throws PropertyNotWritableException
	 *             if the final variable or property resolution failed because the specified
	 *             variable or property is not writable.
	 * @throws ELException
	 *             if an exception was thrown while attempting to set the property or variable. The
	 *             thrown exception must be included as the cause property of this exception, if
	 *             available.
	 */
	/* void */
	this.setValue = function(/* ELContext */ context, /* object */value) {
		if(this.isReadOnly(context)) {
			throw new adf.mf.PropertyNotWritableException(this.expression.toString());
		}
		
		if(adf.mf.log.Framework.isLoggable(adf.mf.log.level.FINEST)) 
		{
			adf.mf.log.Framework.logp(adf.mf.log.level.FINEST, "ValueExpression", "setValue",
			                       ("adfmf- setValue " + this.expression.toString() + " = " + adf.mf.util.stringify(value)));
		}

		/* set the value */
		var vr = this.getValueReference(context, true);
		
		if(adf.mf.log.Framework.isLoggable(adf.mf.log.level.FINEST)) 
		{
			adf.mf.log.Framework.logp(adf.mf.log.level.FINEST, "ValueExpression", "setValue",
			                       ("adfmf- have the " + this.expression.toString() + " value reference"));
		}

		if(vr.isPropertyObjectResolved()) {
			if(adf.mf.log.Framework.isLoggable(adf.mf.log.level.FINEST)) 
			{
				adf.mf.log.Framework.logp(adf.mf.log.level.FINEST, "ValueExpression", "setValue",
						("Case-1 po [" + vr.baseName + "."+vr.propertyName + "] is resolved setting the value " + value));
			}

			context.getELResolver().setValue(context, vr.baseObject, vr.propertyName, value);
			
			if(adf.mf.log.Framework.isLoggable(adf.mf.log.level.FINEST)) 
			{
				adf.mf.log.Framework.logp(adf.mf.log.level.FINEST, "ValueExpression", "setValue",
						("Case-1 po [" + vr.baseName + "."+vr.propertyName + "] done."));
			}
		}
		else if(vr.isBaseObjectResolved()) {
			if(adf.mf.log.Framework.isLoggable(adf.mf.log.level.FINEST)) 
			{
				adf.mf.log.Framework.logp(adf.mf.log.level.FINEST, "ValueExpression", "setValue",
						("Case-2 bo ["+ vr.baseName+"] is resolved setting the value for " + vr.propertyName));
			}

			context.getELResolver().setValue(context, vr.baseObject, vr.propertyName, value);
			
			if(adf.mf.log.Framework.isLoggable(adf.mf.log.level.FINEST)) 
			{
				adf.mf.log.Framework.logp(adf.mf.log.level.FINEST, "ValueExpression", "setValue",
				                       ("Case-2 complete: base object now looks like: [" + adf.mf.util.stringify(vr.baseObject) + "]"));
			}
		}
		else if(vr.baseName.length > 0){
			if(adf.mf.log.Framework.isLoggable(adf.mf.log.level.FINEST)) 
			{
				adf.mf.log.Framework.logp(adf.mf.log.level.FINEST, "ValueExpression", "setValue",
						("Case-3 bn ["+vr.baseName+" is not null, need to fake the object"));
			}
            
			// added change here to support automatic variable definition
			context.setVariable(vr.baseName, {});
			this.setValue(context, value);
			
			if(adf.mf.log.Framework.isLoggable(adf.mf.log.level.FINEST)) 
			{
				adf.mf.log.Framework.logp(adf.mf.log.level.FINEST, "ValueExpression", "setValue",
						("case-3: pn: " + vr.baseName + " = " + value));
		}
		}
		else {
			if(adf.mf.log.Framework.isLoggable(adf.mf.log.level.FINEST)) 
			{
				adf.mf.log.Framework.logp(adf.mf.log.level.FINEST, "ValueExpression", "setValue",
				                       ("Case-4 nothing else worked " + vr.propertyName + " is going to be set."));
			}
			
			// added change here to support automatic variable definition
			context.setVariable(vr.propertyName, value);
			
			if(adf.mf.log.Framework.isLoggable(adf.mf.log.level.FINEST)) 
			{
				adf.mf.log.Framework.logp(adf.mf.log.level.FINEST, "ValueExpression", "setValue",
				                       ("case-4: pn:" + vr.propertyName + " = " + value));
		}
		}
	};
	

	/**
	 * Returns a {@link ValueReference} for this expression instance.
	 * 
	 * @param context
	 *            the context of this evaluation
	 * @return the <code>ValueReference</code> for this <code>ValueExpression</code>, or
	 *         <code>null</code> if this <code>ValueExpression</code> is not a reference to a base
	 *         (null or non-null) and a property. If the base is null, and the property is a EL
	 *         variable, return the <code>ValueReference</code> for the <code>ValueExpression</code>
	 *         associated with this EL variable.
	 * @throws PropertyNotFoundException
	 *             if one of the property resolutions failed because a specified variable or
	 *             property does not exist or is not readable.
	 * @throws ELException
	 *             if an exception was thrown while performing property or variable resolution. The
	 *             thrown exception must be included as the cause property of this exception, if
	 *             available.
	 * @since 2.2
	 */
	/* ValueReference */
	this.getValueReference = function(/* ELContext */ context, /* boolean */ autoCreate) {
		return new adf.mf.el.ValueReference(context, this.expression.toString(), autoCreate);
	};
};


/////////////////////////////////////// end of /Users/buildprocess/HudsonHome/jobs/adfmf-v11-11.1.2.4.1-tip/workspace/Container/JavaScript/ADF/js/ValueExpression.js///////////////////////////////////////



/////////////////////////////////////// start of /Users/buildprocess/HudsonHome/jobs/adfmf-v11-11.1.2.4.1-tip/workspace/Container/JavaScript/ADF/js/RootPropertyELResolver.js///////////////////////////////////////

// @requires ELErrors
// @requires ArrayELResolver
// @requires MapELResolver
// @requires CompositeELResolver
// @requires JavaScriptExpressionFactory
// @requires ValueExpression
// @requires ValueReference


var adf                    = window.adf                 || {};
adf.mf                     = adf.mf                     || {};
adf.mf.api                 = adf.mf.api                 || {};
adf.mf.el                  = adf.mf.el                  || {};
adf.mf.locale              = adf.mf.locale              || {};
adf.mf.log                 = adf.mf.log                 || {};
adf.mf.resource            = adf.mf.resource            || {};
adf.mf.util                = adf.mf.util                || {};

adf.mf.internal            = adf.mf.internal            || {};
adf.mf.internal.api        = adf.mf.internal.api        || {};
adf.mf.internal.el         = adf.mf.internal.el         || {};
adf.mf.internal.el.parser  = adf.mf.internal.el.parser  || {};
adf.mf.internal.locale     = adf.mf.internal.locale     || {};
adf.mf.internal.log        = adf.mf.internal.log        || {};
adf.mf.internal.mb         = adf.mf.internal.mb         || {};
adf.mf.internal.perf       = adf.mf.internal.perf       || {};
adf.mf.internal.perf.story = adf.mf.internal.perf.story || {};
adf.mf.internal.resource   = adf.mf.internal.resource   || {};
adf.mf.internal.util       = adf.mf.internal.util       || {};

(function() {
	function RootPropertyELResolver(/* boolean */ readOnly) { /* implements ELResolver */
		this.readOnly = (readOnly === undefined)? false : readOnly;

		/**
		 * If the base object is a string, returns the most general type that this resolver
		 * accepts for the property argument. Otherwise, returns null. Assuming the base is a string,
		 * this method will always return integer type. This is because arrays accept integers for
		 * their index.
		 * 
		 * @param context
		 *            The context of this evaluation.
		 * @param base
		 *            Must be null.
		 * @return string
		 */
		/* Type */
		this.getCommonPropertyType = function(/* ELContext */ context, /* object */ base) {
			return this.isResolvable(base) ? string : null;
		};

		/**
		 * Not Implemented
		 */
		/* Iterator<FeatureDescriptor> */
		this.getFeatureDescriptors = function(/* ELContext */ context, /* object */ base) {
			return null;
		};

		/**
		 * If the base object is null, returns the most general acceptable type for a value in this
		 * property.
		 * 
		 * @param context
		 *            The context of this evaluation.
		 * @param base
		 *            Must be null.
		 * @param property
		 *            The property to resolve.
		 * @return type of the property if found, otherwise return object
		 * @throws NullPointerException
		 *             if context is null
		 * @throws ELException
		 *             if an exception was thrown while performing the property or variable resolution.
		 *             The thrown exception must be included as the cause property of this exception, if
		 *             available.
		 */
		/* Type */
		this.getType = function(/* ELContext */ context, /* object */ base, /* object */ property) {
			var result = null;

			if (context === null) {
				throw new adf.mf.NullPointerException("context is null");
			}
			
			if (this.isResolvable(base)) {
				context.setPropertyResolved(true);
				result = (typeof (context.getVariableMapper())[property]) | 'object';
			}
			return result;
		};

		/**
		 * If the base object is a Java language array, returns the value at the given index. The index
		 * is specified by the property argument, and coerced into an integer. If the coercion could not
		 * be performed, an IllegalArgumentException is thrown. If the index is out of bounds, null is
		 * returned. If the base is a Java language array, the propertyResolved property of the
		 * ELContext object must be set to true by this resolver, before returning. If this property is
		 * not true after this method is called, the caller should ignore the return value.
		 * 
		 * @param context
		 *            The context of this evaluation.
		 * @param base
		 *            Must be null.
		 * @param property
		 *            Property to resolve and fetch.
		 * @return property value
		 * @throws NullPointerException
		 *             if context is null
		 * @throws ELException
		 *             if an exception was thrown while performing the property or variable resolution.
		 *             The thrown exception must be included as the cause property of this exception, if
		 *             available.
		 */
		/* object */ 
		this.getValue = function(/* ELContext */ context, /* object */ base, /* object */ property) {
			var result = null;
			
			if (context === null) {
				throw new adf.mf.NullPointerException("context is null");
			}
			
			if (this.isResolvable(base)) {
				var  variables = context.getVariableMapper();
				
				try {
					// adf.mf.internal.perf.trace("adf.mf.internal.el.RootPropertyELResolver", "getValue: " + property);	
					result = variables.resolveVariable(property);
					
					if((result instanceof Object) && 
					   (result[adf.mf.internal.api.constants.WEAK_REFERENCE_PROPERTY] !== undefined))
					{
						var ref = result[adf.mf.internal.api.constants.WEAK_REFERENCE_PROPERTY];
						var vr  = new adf.mf.el.ValueReference(context, ref, false);
						
						result = vr.resolve();
						
						if((vr.isBaseObjectResolved()) && (!vr.isPropertyObjectResolved()))
						{
							result                         = {};
							vr.baseObject[vr.propertyName] = result;
						}
					}
					
					// alert("adf.mf.internal.el.RootPropertyELResolver:getValue: " + property + " = " + adf.mf.util.stringify(result));	
					context.setPropertyResolved(result !== undefined);
				}catch(e) {
					context.setPropertyResolved(false);
				}
			}
			return result;
		};

		/**
		 * If the base object is null, returns whether a call to
		 * {@link #setValue(ELContext, object, object, object)} will always fail. The propertyResolved 
		 * property of the ELContext object must be set to true by this resolver, before returning. If 
		 * this property is not true after this method is called, the caller should ignore the return 
		 * value. If this resolver was constructed in read-only mode, this method will always return 
		 * true. Otherwise, it returns false.
		 * 
		 * @param context
		 *            The context of this evaluation.
		 * @param base
		 *            Must be null.
		 * @param property
		 *            Property to be resolved.
		 * @return If the propertyResolved property of ELContext was set to true, then true if calling
		 *         the setValue method will always fail or false if it is possible that such a call may
		 *         succeed; otherwise undefined.
		 * @throws NullPointerException
		 *             if context is null
		 * @throws ELException
		 *             if an exception was thrown while performing the property or variable resolution.
		 *             The thrown exception must be included as the cause property of this exception, if
		 *             available.
		 */
		/* boolean */
		this.isReadOnly = function(/* ELContext */ context, /* object */ base, /* object */ property) {
			if (context === null) {
				throw new adf.mf.NullPointerException("context is null");
			}
			
			if (this.isResolvable(base)) {
				context.setPropertyResolved(true);
			}
			return this.readOnly;
		};

		/**
		 * If the base object is null, attempts to set the property value with the given value. 
		 * 
		 * @param context
		 *            The context of this evaluation.
		 * @param base
		 *            Must be null.
		 * @param property
		 *            Property to be set.
		 * @param value
		 *            The value to be set.
		 * @throws PropertyNotFoundException
		 *             if the given property is not found
		 * @throws NullPointerException
		 *             if context is null
		 * @throws PropertyNotWritableException
		 *             if this resolver was constructed in read-only mode.
		 * @throws ELException
		 *             if an exception was thrown while performing the property or variable resolution.
		 *             The thrown exception must be included as the cause property of this exception, if
		 *             available.
		 */
		/* void */
		this.setValue = function(/* ELContext */ context, /* object */ base, /* object */ property, /* object */ value) {
			if (context === null) {
				throw new adf.mf.NullPointerException("context is null");
			}
			
			if (this.isResolvable(base)) {
				if (this.readOnly) {
					throw new adf.mf.PropertyNotWritableException("resolver is read-only");
				}
				
				context.getVariableMapper().setVariable(property, value);
				context.setPropertyResolved(true);
			}
		};

		/**
		 * Test whether the given base should be resolved by this ELResolver.
		 * 
		 * @param base
		 *            The bean to analyze.
		 * @param property
		 *            The name of the property to analyze. Will be coerced to a String.
		 * @return base != null && base.isArray()
		 */
		/* boolean */ 
		this.isResolvable = function(/* object */ base) {
			return ((base === undefined) || (base === null));
		};
	};
	
	adf.mf.internal.el.RootPropertyELResolver = RootPropertyELResolver;
})();




/////////////////////////////////////// end of /Users/buildprocess/HudsonHome/jobs/adfmf-v11-11.1.2.4.1-tip/workspace/Container/JavaScript/ADF/js/RootPropertyELResolver.js///////////////////////////////////////



/////////////////////////////////////// start of /Users/buildprocess/HudsonHome/jobs/adfmf-v11-11.1.2.4.1-tip/workspace/Container/JavaScript/ADF/js/ELParser.js///////////////////////////////////////

// @requires ELErrors
// @requires ArrayELResolver
// @requires MapELResolver
// @requires CompositeELResolver
// @requires JavaScriptExpressionFactory
// @requires ValueExpression
// @requires ValueReference

// @requires RootPropertyELResolver
// @requires JavaScriptContext


var adf                    = window.adf                 || {};
adf.mf                     = adf.mf                     || {};
adf.mf.api                 = adf.mf.api                 || {};
adf.mf.el                  = adf.mf.el                  || {};
adf.mf.locale              = adf.mf.locale              || {};
adf.mf.log                 = adf.mf.log                 || {};
adf.mf.resource            = adf.mf.resource            || {};
adf.mf.util                = adf.mf.util                || {};

adf.mf.internal            = adf.mf.internal            || {};
adf.mf.internal.api        = adf.mf.internal.api        || {};
adf.mf.internal.el         = adf.mf.internal.el         || {};
adf.mf.internal.el.parser  = adf.mf.internal.el.parser  || {};
adf.mf.internal.locale     = adf.mf.internal.locale     || {};
adf.mf.internal.log        = adf.mf.internal.log        || {};
adf.mf.internal.mb         = adf.mf.internal.mb         || {};
adf.mf.internal.perf       = adf.mf.internal.perf       || {};
adf.mf.internal.perf.story = adf.mf.internal.perf.story || {};
adf.mf.internal.resource   = adf.mf.internal.resource   || {};
adf.mf.internal.util       = adf.mf.internal.util       || {};

/**
 * Literals:
 *    Boolean: true and false
 *    Integer: as in Java
 *    Floating point: as in Java
 *    String: with single and double quotes; " is escaped as \", ' is escaped as \', and \ is escaped as \\.
 *    Null: null
 *    
 * Operators:
 *    In addition to the . and [] operators discussed in Variables, there is the additional operators:
 *       Arithmetic: +, - (binary), *, / and div, % and mod, - (unary)
 *       Logical: and, &&, or, ||, not, !
 *       Relational: ==, eq, !=, ne, <, lt, >, gt, <=, ge, >=, le. 
 *                  Comparisons can be made against other values, or against boolean, 
 *                  string, integer, or floating point literals.
 *       Empty: The empty operator is a prefix operation that can be used to determine whether a value is null or empty.
 *       Conditional: A ? B : C. Evaluate B or C, depending on the result of the evaluation of A.
 *       
 *   The precedence of operators highest to lowest, left to right is as follows:
 *      1. [] .
 *      2. () - Used to change the precedence of operators.
 *      3. - (unary) not ! empty
 *      4. * / div % mod
 *      5. + - (binary)
 *      6. < > <= >= lt gt le ge
 *      7. == != eq ne
 *      8. && and
 *      9. || or
 *     10. ? :
 *     
 *  Reserved Words:
 *  The following words are reserved for the JSP expression language and should not be used as identifiers.
 *      and   eq   gt   true   instanceof
 *      or    ne   le   false  empty
 *      not   lt   ge   null   div   mod 
 *  Note that many of these words are not in the language now, but they may be in the future, 
 *  so you should avoid using them.
 *  
 *  Examples:
 *  Here are some example EL expressions and the result of evaluating them.
 *  
 *  EL Expression						Result
 *  ----------------------------------	--------------------------------------------------------------------
 *  ${1 > (4/2)}						false
 *  ${4.0 >= 3}							true
 *  ${100.0 == 100}						true
 *  ${(10*10) ne 100}					false
 *  ${'a' < 'b'}						true
 *  ${'hip' gt 'hit'}					false
 *  ${4 > 3}							true
 *  ${1.2E4 + 1.4}						12001.4
 *  ${3 div 4}							0.75
 *  ${10 mod 4}							2
 *  ${empty param.Add}					True if the request parameter named Add is null or an empty string
 *  ${pageContext.request.contextPath}	The context path
 *  ${sessionScope.cart.numberOfItems}	The value of the numberOfItems property of the session-scoped attribute 
 *  									named cart 
 *  ${param['mycom.productId']}			The value of the request parameter named mycom.productId
 *  ${header["host"]}					The host
 *  ${departments[deptName]}			The value of the entry named deptName in the departments map
 *  
 *  
 *  How to use the ELParser and ELExpression objects:
 *  - If you want to parse and evaluate an expression for a one time evaluation (i.e. will not be cached)
 *    do the following:
 *      adf.mf.internal.el.parser.evaluate(expression, context);
 *    i.e.
 *      adf.mf.internal.el.parser.evaluate("Hello", context);
 *      adf.mf.internal.el.parser.evaluate("${1.23E3}", context);
 *      adf.mf.internal.el.parser.evaluate("${applicationScope.loginRequired}", context);
 *      adf.mf.internal.el.parser.evaluate("${applicationScope.variableA < applicationScope.variableB}", context);
 *  
 *  - If you want to parse an expression and use it over and over or simply let the "system" cached the expression
 *    for you, do the following:
 *      var expr      = adf.mf.internal.el.parser.parse(expression);
 *      ...
 *      var value     = expr.evaluate(context);  // can be called multiple times 
 *      
 *    i.e.
 *      var expr = adf.mf.internal.el.parser.evaluate("Hello");
 *      expr.evaluate(context);  // can be called multiple times 
 *      
 *      var expr = adf.mf.internal.el.parser.evaluate("${1.23E3}");
 *      expr.evaluate(context);  // can be called multiple times
 *       
 *      var expr = adf.mf.internal.el.parser.evaluate(context, "${applicationScope.loginRequired}");
 *      expr.evaluate(context);  // can be called multiple times
 *       
 *      var expr = adf.mf.internal.el.parser.evaluate(context, "${applicationScope.variableA < applicationScope.variableB}");
 *      expr.evaluate(context);  // can be called multiple times 
 */
(function() {
	var ELParser = function () {
		adf.mf.internal.el.parser.parse = function (expr) {
			return new ELParser().parse(expr);
		};

		adf.mf.internal.el.parser.evaluate = function (context, expr) {
			return adf.mf.internal.el.parser.parse(expr).evaluate(context);
		};

		function ELExpression(tokens, unaryOperations, binaryOperations, ternaryOperations, functions) {
			this.tokens             = tokens;
			this.unaryOperations    = unaryOperations;
			this.binaryOperations   = binaryOperations;
			this.ternaryOperations  = ternaryOperations;
			this.functions          = functions;
			this.stringVersion      = null;
			this.readonly           = null;
		}
		// ELParser.ELExpression = ELExpression;

		/**
		 * Expressions are also designed to be immutable so that only one instance needs to be created for 
		 * any given expression String / {@link FunctionMapper}. This allows a container to pre-create 
		 * expressions and not have to reparse them each time they are evaluated.
		 */
		ELExpression.prototype = {
				ensureItIsNotTheNullObject: function(t) {
					return (t == null)? null : (t[".null"] == true)? "" : t;
				},
				
				evaluate: function (context) {
					var n1, n2, n3, fn, item;
					var nstack       = [];
					var tokenLength  = this.tokens.length;
					var vr           = null;
					var val          = null;

					for (var i = 0; i < tokenLength; i++) {
						item = this.tokens[i];
						var type = item.type;
						if (type === TOKEN_CONSTANT) {
							nstack.push(item.value);
						}
						else if (type === TOKEN_TERNARY_OPERATOR) {
							n3 = this.ensureItIsNotTheNullObject(nstack.pop());
							n2 = this.ensureItIsNotTheNullObject(nstack.pop());
							n1 = this.ensureItIsNotTheNullObject(nstack.pop());
							fn = (this.ternaryOperations[item.index])[1]; /* function to execute the operation */
							nstack.push(fn(n1, n2, n3));
						}
						else if (type === TOKEN_BINARY_OPERATOR) {
							n2 = this.ensureItIsNotTheNullObject(nstack.pop());
							n1 = this.ensureItIsNotTheNullObject(nstack.pop());
							fn = (this.binaryOperations[item.index])[1]; /* function to execute the operation */
							nstack.push(fn(n1, n2));
						}
						else if (type === TOKEN_INDEX) {
							n2 = this.ensureItIsNotTheNullObject(nstack.pop());
							n1 = this.ensureItIsNotTheNullObject(nstack.pop());
							nstack.push(n1[n2]);
						}
						else if (type === TOKEN_COMMA) {
							/* ignore */
						}
						else if (type === TOKEN_COLON) {
							/* ignore */
						}
						else if (type === TOKEN_NO_ARGS) {
							/* ignore */
						}
						else if (type === TOKEN_DOT_OFFSET) {
							/* ignore */
						}
						else if (type === TOKEN_PROPERTY) {
							n2 = item.index;
							n1 = this.ensureItIsNotTheNullObject(nstack.pop());
							
							n3 = n2.split(".");
							
							if(n3 != undefined) {
								for(var j = 0; j < n3.length; ++j)
								{
									if((n1 !== undefined) && (n1 !== null)) {
										n1 = n1[n3[j]];
									}
								}
							}
							else {
								n1 = n1[n2];
							}
							
							nstack.push(n1);
						}
						else if (type === TOKEN_VARIABLE) {
							vr  = new adf.mf.el.ValueReference(context, item.index, false);
							val = vr.resolve();
							
							if (vr.isPropertyObjectResolved()) {
								nstack.push(val);  			                 // note: variable replacement here
							}
							else if (item.index in this.functions) {
								// Since we do not want to store or resolve any method expressions locally, we simply need to
								// throw a PNF exception so it will force the evaluation process to fetch the entire expression
								// from the java side.
								// nstack.push(this.functions[item.index]);      // note: function evaluation here
								throw new adf.mf.PropertyNotFoundException(item.index); // do not resolve functions locally
							}
							else {
								throw new adf.mf.PropertyNotFoundException(item.index);
							}
						}
						else if (type === TOKEN_UNARY_OPERATOR) {
							n1 = nstack.pop();
							fn = (this.unaryOperations[item.index])[1];
							nstack.push(fn(n1));
						}
						else if (type === TOKEN_FUNCTION) {
							n1 = nstack.pop();
							fn = nstack.pop();
							if (fn.apply && fn.call) {
								if (Object.prototype.toString.call(n1) == "[object Array]") {
									n1.push(context);
								}
								else {
									var x = n1;
									
									n1 = [x];
									n1.push(context);
								}
								nstack.push(fn.apply(undefined, n1));
							}
							else {
								throw new adf.mf.ELException(fn + " is not a function");
							}
						}
						else {
							throw new adf.mf.ELException("invalid ELExpression - " + type);
						}
					}
					if (nstack.length > 1) {
						throw new adf.mf.ELException("invalid ELExpression (mis-match tokens and operations)");
					}
					return nstack[0];
				},
				
				
				/**
				 * Determines whether the specified object is equal to this ELExpression. The result is true if
				 * and only if the argument is not null, is an ELExpression object that is the of the same type
				 * (ValueExpression or MethodExpression), and has an identical parsed representation. Note that
				 * two expressions can be equal if their expression Strings are different. For example,
				 * ${fn1:foo()} and ${fn2:foo()} are equal if their corresponding FunctionMappers mapped fn1:foo
				 * and fn2:foo to the same method.
				 * 
				 * @param obj
				 *            the object to test for equality.
				 * @return true if obj equals this ELExpression; false otherwise.
				 */
				/* boolean */
				equals: function(/* object */ obj) {
					return (this.getExpressionString() == obj.getExpressionString());
				},


				/**
				 * Returns the original String used to create this ELExpression, unmodified. This is used for
				 * debugging purposes but also for the purposes of comparison (e.g. to ensure the expression in
				 * a configuration file has not changed). This method does not provide sufficient information to
				 * re-create an expression. Two different expressions can have exactly the same expression
				 * string but different function mappings. Serialization should be used to save and restore the
				 * state of an ELExpression.
				 * 
				 * @return The original expression String.
				 */
				/* String */ 
				getExpressionString: function() {
					if(this.stringVersion === null) {
						this.stringVersion = this.toString();
					}
					return this.stringVersion;
				},
				

				/**
				 * Returns whether this expression was created from only literal text. This method must return
				 * true if and only if the expression string this expression was created from contained no
				 * unescaped EL delimeters (${...} or #{...}).
				 * 
				 * @return true if this expression was created from only literal text; false otherwise.
				 */
				isLiteralText: function() {
					var tokenLength = this.tokens.length;

					for (var i = 0; i < tokenLength; i++) {
						var item = this.tokens[i];
						if((item.type === TOKEN_VARIABLE) || (item.type === TOKEN_FUNCTION)) {
							return false;
						}
					}
					return true;
				},
				
				
				/**
				 * Evaluates the expression as an lvalue and determines if {@link #setValue(ELContext, Object)}
				 * will always fail.
				 * 
				 * @param context used to resolve properties (<code>base.property</code> and <code>base[property]</code>)
				 * and to determine the result from the last base/property pair
				 * @return <code>true</code> if {@link #setValue(ELContext, Object)} always fails.
				 * @throws ELException if evaluation fails (e.g. property not found, type conversion failed, ...)
				 */
				/* boolean */
				isReadOnly: function() {
					if(this.readonly === null) {
						this.readonly = !((this.tokens.length > 0) && (this.tokens[0].type == TOKEN_VARIABLE));
					} 
					return this.readonly;
				},
				
				/**
				 * obtain all the variables this expression is dependent on.
				 * 
				 * @returns {Array}
				 */
				dependentObjects: function () {
					var tokenLength = this.tokens.length;
					var vars        = [];
					for (var i = 0; i < tokenLength; i++) {
						var item = this.tokens[i];
						if((item.type === TOKEN_VARIABLE) && (vars.indexOf(item.index) == -1)) {
							vars.push(item.index);
						}
					}
					return vars;
				},
				
				isComplexExpression: function() {
					return (this.tokens.length > 1);
				},
				
				
				/**
				 * convert the ELExpression to a context free expression.
				 */
				dependencies: function () {
					if(this.term == undefined) {
						this.toContextFreeExpression();
					}
					return this.term;
				},
				
				cleanup: function(/* Array */ arr, /* Array */ exclude)
				{
					var dfarr  = adf.mf.util.removeDuplicates(arr);
					var elen   = exclude.length;
					var dlen   = dfarr.length;
					
					for(var e = 0; e < elen; ++e)
					{
					  for(var d = 0; d < dlen; ++d)
					  {
					     if(dfarr[d] == exclude[e]) {
					       dfarr.splice(d, 1);
					     }
					  }
					}
					
				    // alert("cleanup("+arr.join(",")+" and " + exclude.join(",") + ")  ==> " + dfarr);
					return dfarr;
				},
				
				/**
				 * convert the ELExpression to a context free expression.
				 */
				getStringRepresentation: function (/* boolean */ bContextFree, /* array */ tokenReplacement) {
					var tokenLength      = this.tokens.length;
					var nstack           = [];
					var term             = [];
					var uterm            = [];
					var n1, n2, n3, fn;
					var item;

					for (var i = 0; i < tokenLength; i++) {
						item = this.tokens[i];

						var type = item.type;
						
						if (type === TOKEN_CONSTANT) {
							n1 = escape(item.value);
							nstack.push(n1);
							// term.push(n1);
						}
						else if (type === TOKEN_TERNARY_OPERATOR) {
							n3 = nstack.pop();
							n2 = nstack.pop();
							n1 = nstack.pop();
							fn = item.index;
							nstack.push("((" + n1 + ")? " + n2 + " : " + n3 + ")");
							// term.push(n1); term.push(n2); term.push(n3);
						}
						else if (type === TOKEN_COMMA) {
							n2 = nstack.pop();
							n1 = nstack.pop();
							fn = item.index;
							nstack.push("" + n1 + ", " + n2 + "");
							// term.push(n2); 
						}
						else if (type === TOKEN_COLON) {
							/* ignore */
						}
						else if (type === TOKEN_NO_ARGS) {
							nstack.push("");
						}
						else if (type === TOKEN_BINARY_OPERATOR) {
							n2 = nstack.pop();
							n1 = nstack.pop();
							fn = item.index;
							nstack.push("(" + n1 + " " + fn + " " + n2 + ")");
							// term.push(n1); term.push(n2); 
						}
						else if (type === TOKEN_INDEX) {
							n2 = nstack.pop();
							n1 = nstack.pop();
							fn = item.index;
							n3 = "" + n1 + "[" + n2 + "]";
							nstack.push(n3);
							// term.pop(); term.pop(); term.push(n3); term.push(n2); uterm.push(n1);
							uterm.push(n1); 
							term.push(n3);
						}
						else if (type === TOKEN_DOT_OFFSET) {
							n2 = nstack.pop();
							n1 = nstack.pop();
							fn = item.index;
							n3 = "" + n1 + "." + n2 + "";
							nstack.push(n3);
							//term.pop(); term.push(n1 + "." + n2); uterm.push(n1); uterm.push(n2);
							term.push(n3);
						}
						else if (type === TOKEN_PROPERTY) {
							nstack.push(item.index);
						}
						else if (type === TOKEN_VARIABLE) {
							var  variable = item.index;

							if((tokenReplacement != undefined) || (tokenReplacement != null))
							{
								var  dot      = variable.indexOf(".");
								var  token1   = variable.substring(0, dot) || variable;
								var  value0   = tokenReplacement[token1]   || token1;
								var  value1   = adf.mf.el.getLocalValue(value0);

								if(value1 !== undefined) 
								{
									// change the variable to be it's token replaced form
									variable = variable.replace(token1, value1);
								}
							}
						        	
							if(bContextFree)
							{
								var  token1   = (variable).substring(0, (variable.indexOf(".")));
								var  value1   = adf.mf.el.getLocalValue("#{"+token1+"}");
								
								if((value1 !== undefined) && (value1.getAlias !== undefined)) 
								{
									// change the variable to be it's context free (alias) form
									variable = variable.replace(token1, value1.getAlias(true));
									
									variable = adf.mf.internal.context.uncompressReference(variable);
								}
							}
							
							nstack.push(variable);
							term.push(variable);
						}
						else if (type === TOKEN_UNARY_OPERATOR) {
							n1 = nstack.pop();
							f = item.index;
							if (f === "!") {
								nstack.push("(" + "!" + n1 + ")");
							}
							else if (f === "-") {
								nstack.push("(" + "-" + n1 + ")");
							}
							else {
								nstack.push(f + "(" + n1 + ")");
							}
						}
						else if (type === TOKEN_FUNCTION) {
							n1 = nstack.pop();
							fn = nstack.pop();
							nstack.push(fn + "(" + n1 + ")");
							term.push(fn + "(" + n1 + ")");
							uterm.push(fn);
						}
						else {
							throw new adf.mf.ELException("Invalid ELExpression");
						}
					}
					if (nstack.length > 1) {
						throw new adf.mf.ELException("Invalid ELExpression (incorrect number of operands)");
					}
					
					this.term = this.cleanup(term, uterm);
					return nstack[0]; 
				},

				toContextFreeExpression: function() {
					var exp = this.getStringRepresentation(/* context free */ true, undefined);
					
					return "#{" + adf.mf.internal.context.uncompressReference(exp) + "}";
				},

				replaceTokens: function(/* context free */ bContextFree, /* array */ tokenReplacement) {
					return this.getStringRepresentation(bContextFree, tokenReplacement);
				},

				toString: function() {
					return this.getStringRepresentation(/* context free */ false, undefined);
				}
		};
		

		function object(o) {
			function F() {}
			F.prototype = o;
			return new F();
		}

		/* types of tokens that will be encountered */
		var TOKEN_CONSTANT         =  0;
		var TOKEN_UNARY_OPERATOR   =  1;
		var TOKEN_BINARY_OPERATOR  =  2;
		var TOKEN_TERNARY_OPERATOR =  3;
		var TOKEN_VARIABLE         =  4;
		var TOKEN_FUNCTION         =  5;
		var TOKEN_INDEX            =  6;
		var TOKEN_DOT_OFFSET       =  7;
		var TOKEN_PROPERTY         =  8;
		var TOKEN_COLON            =  9;
		var TOKEN_COMMA            = 10;
		var TOKEN_NO_ARGS          = 11;
		
		function Token(type, index, prior, value) {
			this.type  = type;
			this.index = index || 0;
			this.prior = prior || 3;
			this.value = (value !== undefined) ? value : null;
			
			this.toString = function () {
				switch (this.type) {
				case TOKEN_CONSTANT:         return escape(this.value);
				case TOKEN_UNARY_OPERATOR:   /* or */
				case TOKEN_BINARY_OPERATOR:  /* or */
				case TOKEN_TERNARY_OPERATOR: /* or */
				case TOKEN_NO_ARGS:          /* or */
				case TOKEN_INDEX:            /* or */
				case TOKEN_COLON:            /* or */
				case TOKEN_COMMA:            /* or */
				case TOKEN_DOT_OFFSET:       /* or */
				case TOKEN_VARIABLE:         return this.index;
				case TOKEN_FUNCTION:         return "INVOKE";
				default:                     return "Invalid Token";
				}
			};
		}


		function isStr(s)                 { return typeof(s) === 'string' || s instanceof String; }
		function concat(a, b)             { return "" + a + b;                   }

		/* standard EL binary operations implementations   */
		//function add(a, b)                { return (isStr(a) || isStr(b))? ("" + a + b) : (a + b); }
		function add(a, b)                { return a + b;                        }
		function subtract(a, b)           { return a - b;                        }
		function multiply(a, b)           { return a * b;                        }
		function divide(a, b)             { return a / b;                        }
		function modulo(a, b)             { return a % b;                        }
		function index(a, b)              { return a[b];                         }
		
		/* standard EL unary operation implementations    */
		function negate(a)                { return -a;                           }
		function empty(a)                 { return ((a === null) || (a === '')); }
		function not(a)                   { return !coerce(a);                   }
		
		/* standard EL logical operations implementations */
		function greaterThanOrEqual(a, b) { return a >= b;                       }
		function greaterThan(a, b)        { return a > b;                        }
		function lessThanOrEqual(a, b)    { return a <= b;                       }
		function lessThan(a, b)           { return a < b;                        }
		function equals(a, b)             { return coerce(a) == coerce(b);       }
		function notEqual(a, b)           { return coerce(a) != coerce(b);       }
		function or(a, b)                 { return coerce(a) || coerce(b);       }
		function and(a, b)                { return coerce(a) && coerce(b);       }
		function ternary(a,b,c)           { return (coerce(a))? b : c;           }
		
		/* coerce the value to a boolean if so be it */
		function coerce(a) {  
			return (a == "true")? true : (a == "false")? false : a; 
		}

		/* standard EL function implementations           */
		function unknown()                {                                      }
		function block()     {}
		
		function append(a, b) {
			if (Object.prototype.toString.call(a) != "[object Array]") {
				return [a, b];
			}
			a = a.slice();
			a.push(b);
			return a;
		}

		function ELParser() {
			this.success     = false;
			this.errormsg    = "";
			this.expression  = "";

			this.pos         = 0;

			this.value       = 0;
			this.prior       = 3;
			this.token       = 0;
			this.pmatch      = 0;

			/*
			 *  The precedence of operators highest to lowest, left to right is as follows:
			 *      1. [] .
			 *      2. () - Used to change the precedence of operators.
			 *      3. - (unary) not ! empty
			 *      4. * / div % mod
			 *      5. + - (binary)
			 *      6. < > <= >= lt gt le ge
			 *      7. == != eq ne
			 *      8. && and
			 *      9. || or
			 *     10. ? :
			 */
			this.unaryOperations = {
				/* token : [ token, function_to_perform, increment_position_by, prior_token, precedence ]*/
				"-"     : ["-",     negate,          +1, +2, 3],
				"!"     : ["!",     not,             +1, +2, 3],
				"not"   : ["not",   not,             +3, +2, 3],
				"empty" : ["empty", empty,           +5, +2, 3]
			};
					
			this.binaryOperations = {
				/* token : [ token, function_to_perform, increment_position_by, prior_token, precedence ]*/
				// ",": [",",   append,              +1, -1, -1], ---> not really a binary operator          
				"#"   : ["#",   concat,              +1, +2,  5],
				"+"   : ["+",   add,                 +1, +2,  5],
				"-"   : ["-",   subtract,            +1, +2,  5],
				"*"   : ["*",   multiply,            +1, +1,  4],
				"/"   : ["/",   divide,              +1, +1,  4],
				"div" : ["div", divide,              +3, +2,  4],
				"%"   : ["%",   modulo,              +1, +2,  4],
				"mod" : ["mod", modulo,              +3, +2,  4],
				"and" : ["and", and,                 +3, +2,  8],
				"&&"  : ["&&",  and,                 +2, +2,  8],
				"or"  : ["or",  or,                  +2, +2,  9],
				"||"  : ["||",  or,                  +2, +2,  9],
				"<="  : ["<=",  lessThanOrEqual,     +2, +2,  6],
				"le"  : ["le",  lessThanOrEqual,     +2, +2,  6],
				"<"   : ["<",   lessThan,            +1, +1,  6],
				"lt"  : ["lt",  lessThan,            +2, +1,  6],
				">="  : [">=",  greaterThanOrEqual,  +2, +2,  6],
				"ge"  : ["ge",  greaterThanOrEqual,  +2, +2,  6],
				">"   : [">",   greaterThan,         +1, +2,  6],
				"gt"  : ["gt",  greaterThan,         +2, +2,  6],
				"=="  : ["==",  equals,              +2, +2,  7],
				"eq"  : ["eq",  equals,              +2, +2,  7],
				"!="  : ["!=",  notEqual,            +2, +2,  7],
				"ne"  : ["ne",  notEqual,            +2, +2,  7]
			};

			this.ternaryOperations = {
				/* token : [ token, function_to_perform, increment_position_by, prior_token, precedence ]*/
				"?"   : ["?",   ternary,             +1, +2,  11]
			};

			this.constants = {
				"true"  : true,
				"false" : false,
				"null"  : null
			};
						
			this.functions = {
				"abs"             : Math.abs,
				"sign"            : unknown,
				"pow"             : Math.pow,
				"exp"             : Math.exp,
				"ln"              : unknown,
				"round"           : Math.round,
				"truncate"        : Math.floor,
				"len"             : unknown,
				"strstr"          : unknown,
				"leftstr"         : unknown,
				"rightstr"        : unknown,
				"substr"          : String.substr,
				"lower"           : String.toLowerCase,
				"upper"           : String.toUpperCase,
				"date"            : unknown,
				"now"             : unknown,
				"lookup"          : unknown
			};
		}

		var PRIMARY  = 1 <<  0;
		var OPERATOR = 1 <<  1;
		var FUNCTION = 1 <<  2;
		var LPAREN   = 1 <<  3;
		var RPAREN   = 1 <<  4;
		var COMMA    = 1 <<  5;
		var SIGN     = 1 <<  6;
		var CALL     = 1 <<  7;
		var OPENEXP  = 1 <<  8;
		var CLOSEEXP = 1 <<  9;
		var UNIOP    = 1 << 10;
		var HOOK     = 1 << 11;
		var COLON    = 1 << 12;
		var LBRACE   = 1 << 13;
		var NO_ARGS  = 1 << 14;
		
		/*
		 * Expression Language BNF - taken from the JavaServer Pages 2.0 Specification (Section JSP.2.9 Collected Syntax)
		 * 
		 * Expression           ::= Expression1 ExpressionRest?
		 * ExpressionRest       ::= '?' Expression ':' Expression
		 * Expression1          ::= Expression BinaryOp Expression | UnaryExpression
		 * BinaryOp             ::= 'and' | '&&' | 'or' | '||' | '+' | '-' | '*' | '/' | 'div' | '%' | 'mod' |
		 *                          '<' | 'gt' |'>' | 'lt' | '<=' | 'ge' |'>=' | 'le' | '==' | 'eq' | '=!' | 'ne'
		 * UnaryExpression      ::= UnaryOp UnaryExpression |   Value
		 * UnaryOp              ::= '-' | '!' | 'not' | 'empty'
		 * Value                ::= ValuePrefix | Value ValueSuffix
		 * ValuePrefix          ::= Literal | '(' Expression ')' | Identifier except for ImplicitObject | 
		 *                          ImplicitObject | FunctionInvocation
		 * ValueSuffix          ::= '.' Identifier | '[' Expression ']'
		 * Identifier           ::= Java language identifierCollected Syntax 1-83
		 * ImplicitObject       ::= 'pageContext' | 'pageScope' | 'requestScope' | 'sessionScope' | 'applicationScope' | 
		 *                          'param' | 'paramValues' | 'header' | 'headerValues' | 'initParam' | 'cookie'
		 * FunctionInvocation   ::= (Identifier ':')? Identifier '(' ( Expression ( ',' Expression )* )? ')'
		 * Literal              ::= BooleanLiteral | IntegerLiteral | FloatingPointLiteral | StringLiteral | NullLiteral
		 * BooleanLiteral       ::= 'true' | 'false'
		 * StringLiteral        ::= '([^'\]|\'|\\)*' | "*(\\|"\|[\"^])" 
		 *                          i.e., a string of any characters enclosed by single or double quotes, 
		 *                                where \ is used to escape ', ", and \. It is possible to use single 
		 *                                quotes within double quotes, and vice versa, without escaping.
		 * IntegerLiteral       ::= ['0'-'9']+
		 * FloatingPointLiteral ::= (['0'-'9'])+ '.' (['0'-'9'])* Exponent? | '.' (['0'-'9'])+ Exponent? | (['0'-'9'])+ Exponent?
		 * Exponent             ::= ['e','E'] (['+','-'])? (['0'-'9'])+ 
		 * NullLiteral          ::= 'null'
		 * 
		 * Notes
		 * - An identifier is constrained to be a Java identifier - e.g., no -, no /, etc.
		 * - A String only recognizes a limited set of escape sequences, and \ may not appear unescaped.
		 * - The relational operator for equality is == (double equals).
		 * - The value of an IntegerLiteral ranges from Long.MIN_VALUE to Long.MAX_VALUE
		 * - The value of a FloatingPointLiteral ranges from Double.MIN_VALUE to Double.MAX_VALUE
		 */
		ELParser.prototype = {
			parse: function (expr) {
				var insideExpression = false;
				var operatorStack    = [];
				var tokenStack       = [];
				var expected         = (OPENEXP);
				var nooperands       = 0;
				var token            = null;
				
				this.pmatch          = 0;
				this.errormsg        = "";
				this.success         = true;
				this.expression      = expr;
				this.pos             = 0;
				this.text            = 0;
				this.expCount        = 0;
				
				/* look for nested EL expressions */
				if(expr.match(new RegExp(".*[$#]{[^}]*[$#]{")))	{
					this.parsingError(this.pos, "MSG_EL_PARSER_NESTED_EL_NOT_SUPPORTED");
				}
				
				this.expression = this.expression.replace(/\[/g,"[( ").replace(/\]/g," )]");
				
				while (this.pos < this.expression.length) {
					if((expected & OPENEXP) == OPENEXP) {
						if (this.isExpressionDirective()) {
							/* we have a potential expression */
						} 
						else {
							var txt = null;
							
							if (this.pos + 1 == this.expression.length) {
								txt = this.expression.substring(this.text, this.expression.length);
								if(this.text !== 0){
									this.expCount++;
								}
							}
							else if (this.isOpenExpression()) {
								this.expCount++;
								txt          = this.expression.substring(this.text, this.pos - 1);
								expected     = (PRIMARY | LPAREN | RPAREN | FUNCTION | SIGN | UNIOP | CLOSEEXP);
							}
							
							// in this case have something like: xxx#{...}
							// we want the xxx to be concatenated on the result of #{...}
							if((txt !== null) && (txt.length > 0)) {
								var t   = new Token(TOKEN_CONSTANT, 0, 0, txt);

								if(this.expCount++ > 1) {
									this.token   = "+";   // should go to # if we should concat
									this.prior   = 30;    // 30 = 3 (for add) * 10 (to ensure it is always the last precedence)
									nooperands  += 2;
									this.addfunc(tokenStack, operatorStack, TOKEN_BINARY_OPERATOR);
									this.text    = this.pos;
								}
								
								tokenStack.push(t);
							}
						}
						this.pos++;
					}
					else if (this.isOperator()) {
						if (this.isSign() && (expected & SIGN)) {
							if (this.isNegativeSign()) {
								this.updateState(this.unaryOperations["-"], false);
								nooperands++;
								this.addfunc(tokenStack, operatorStack, TOKEN_UNARY_OPERATOR);
							}
							expected = (PRIMARY | LPAREN | FUNCTION | SIGN | CLOSEEXP);
						}
						else if (this.isComment()) {
							/* do nothing */
						}
						else {
							if ((expected & OPERATOR) === 0) {
								var  rmsg = adf.mf.internal.resource.getResourceStringImpl("ADFInfoBundle", "MSG_EL_PARSER_UNEXPECTED_OPERATOR_FOUND");
								
								this.parsingError(this.pos, rmsg);
							}
							nooperands += 2;
							this.addfunc(tokenStack, operatorStack, TOKEN_BINARY_OPERATOR);
							expected = (PRIMARY | LPAREN | FUNCTION | SIGN | UNIOP | CLOSEEXP);
						}
					}
					else if (this.isOperationToken(this.unaryOperations)) {
						if ((expected & UNIOP) === 0) {
							var  rmsg = adf.mf.internal.resource.getResourceStringImpl("ADFInfoBundle", "MSG_EL_PARSER_UNEXPECTED_UNIARY_OP_FOUND");
							
							this.parsingError(this.pos, rmsg);
						}
						this.addfunc(tokenStack, operatorStack, TOKEN_UNARY_OPERATOR);
						nooperands++;
						expected = (PRIMARY | LPAREN | FUNCTION | SIGN | CLOSEEXP);
					}
					else if (this.isCloseExpression()) {
						if ((expected & CLOSEEXP) === 0) {
							var  rmsg = adf.mf.internal.resource.getResourceStringImpl("ADFInfoBundle", "MSG_EL_PARSER_UNKNOWN_CHAR_FOUND", ["}"]);
							
							this.parsingError(this.pos, rmsg);
						}

						if(this.expCount > 1) {
							this.token   = "+";   // should go to # if we should concat
							this.prior   = 30;    // 30 = 3 (for add) * 10 (to ensure it is always the last precedence)
							nooperands  += 2;
							this.addfunc(tokenStack, operatorStack, TOKEN_BINARY_OPERATOR);
						}
						this.text        = this.pos;
						expected         = (OPENEXP);
					}
					else if (this.isComma()) {
						if ((expected & COMMA) === 0) {
							var  rmsg = adf.mf.internal.resource.getResourceStringImpl("ADFInfoBundle", "MSG_EL_PARSER_UNKNOWN_CHAR_FOUND", [","]);
							
							this.parsingError(this.pos, rmsg);
						}
						this.addfunc(tokenStack, operatorStack, TOKEN_COMMA);
						nooperands += 2;
						expected    = (PRIMARY | LPAREN | FUNCTION | SIGN | UNIOP | CLOSEEXP);
					}
					else if (this.isConstant()) {
						if ((expected & PRIMARY) === 0) {
							var  rmsg = adf.mf.internal.resource.getResourceStringImpl("ADFInfoBundle", "MSG_EL_PARSER_UNEXPECTED_CONSTANT_FOUND");
							
							this.parsingError(this.pos, rmsg);
						}
						var constant = new Token(TOKEN_CONSTANT, 0, 0, this.value);
						tokenStack.push(constant);
						expected = (OPERATOR | HOOK | LPAREN | RPAREN | COLON | COMMA | CLOSEEXP);
					}
					else if (this.isExpressionDirective()) {
					}
					else if (this.isLeftBrace()) {
						if ((expected & LBRACE) === 0) {
							var  rmsg = adf.mf.internal.resource.getResourceStringImpl("ADFInfoBundle", "MSG_EL_PARSER_UNKNOWN_CHAR_FOUND", ["["]);
							
							this.parsingError(this.pos, rmsg);
						}
						else {
							nooperands  +=  2;
							this.prior   =  1;
							this.token   = '[';

							this.addfunc(tokenStack, operatorStack, TOKEN_INDEX);
						}

						expected = (PRIMARY | LPAREN | FUNCTION | UNIOP | SIGN);
					}
					else if (this.isLeftParenthesis()) {
						if ((expected & LPAREN) === 0) {
							var  rmsg = adf.mf.internal.resource.getResourceStringImpl("ADFInfoBundle", "MSG_EL_PARSER_UNKNOWN_CHAR_FOUND", ["("]);
							
							this.parsingError(this.pos, rmsg);
						}

						if (expected & CALL) {
							nooperands +=  2;
							this.prior  =  11;
							this.token  = '(';
							this.addfunc(tokenStack, operatorStack, TOKEN_FUNCTION);
							expected = (PRIMARY | LPAREN | RPAREN | FUNCTION | UNIOP | NO_ARGS | SIGN);
						}
						else
						{
							expected = (PRIMARY | LPAREN | RPAREN | UNIOP | SIGN);
						}
					}
					else if (this.isNumber()) {
						if ((expected & PRIMARY) === 0) {
							var  rmsg = adf.mf.internal.resource.getResourceStringImpl("ADFInfoBundle", "MSG_EL_PARSER_UNEXPECTED_NUMBER_CONSTANT_FOUND");
							
							this.parsingError(this.pos, rmsg);
						}
						token = new Token(TOKEN_CONSTANT, 0, 0, this.value);
						tokenStack.push(token);

						expected = (OPERATOR | HOOK | RPAREN | COLON | COMMA | CLOSEEXP);
					}
					else if (this.isOperationToken(this.binaryOperations)) {
						if ((expected & FUNCTION) === 0) {
							var  rmsg = adf.mf.internal.resource.getResourceStringImpl("ADFInfoBundle", "MSG_EL_PARSER_UNEXPECTED_BINARY_OP_FOUND");
							
							this.parsingError(this.pos, rmsg);
						}
						this.addfunc(tokenStack, operatorStack, TOKEN_BINARY_OPERATOR);
						nooperands += 2;
						expected    = (PRIMARY | LPAREN | UNIOP | SIGN);
					}
					else if (this.isOperationToken(this.ternaryOperations)) {
						if ((expected & HOOK) === 0) {
							var  rmsg = adf.mf.internal.resource.getResourceStringImpl("ADFInfoBundle", "MSG_EL_PARSER_UNEXPECTED_TERNARY_OP_FOUND");
							
							this.parsingError(this.pos, rmsg);
						}
						this.addfunc(tokenStack, operatorStack, TOKEN_TERNARY_OPERATOR);
						nooperands  += 2;
						expected     = (PRIMARY | LPAREN | UNIOP | SIGN);
					}
					else if (this.isRightParenthesis()) {
						if ((expected & RPAREN) === 0) {
							var  rmsg = adf.mf.internal.resource.getResourceStringImpl("ADFInfoBundle", "MSG_EL_PARSER_UNKNOWN_CHAR_FOUND", [")"]);
							
							this.parsingError(this.pos, rmsg);
						}
						
						if((expected & NO_ARGS) === NO_ARGS) {
							var vartoken = new Token(TOKEN_NO_ARGS, this.token, 0, 0);
							tokenStack.push(vartoken);
						}
						
						expected = (OPERATOR | HOOK | RPAREN | COMMA | LBRACE | LPAREN | COLON | CALL | CLOSEEXP);
					}
					else if (this.isRightBrace()) {
						if ((expected & RPAREN) === 0) {
							var  rmsg = adf.mf.internal.resource.getResourceStringImpl("ADFInfoBundle", "MSG_EL_PARSER_UNKNOWN_CHAR_FOUND", ["]"]);
							
							this.parsingError(this.pos, rmsg);
						}
						
						expected = (OPERATOR | HOOK | LBRACE | RPAREN | CLOSEEXP);
						
						if (this.isDot()) {
							nooperands  +=  2;
							this.prior   = -2;
							this.addfunc(tokenStack, operatorStack, TOKEN_DOT_OFFSET);

							if(this.isVariable()) { // this needs to change */
								var vartoken = new Token(TOKEN_PROPERTY, this.token, 0, 0);
								tokenStack.push(vartoken);
							}
							else {
								var  rmsg = adf.mf.internal.resource.getResourceStringImpl("ADFInfoBundle", "MSG_EL_PARSER_UNKNOWN_CHAR_FOUND", ["."]);
								
								this.parsingError(this.pos, rmsg);
							}

							expected = (OPERATOR | HOOK | COLON | RPAREN | COMMA | LPAREN | LBRACE | CALL | CLOSEEXP);
						}
					}
					else if (this.isColon()) {
						if ((expected & COLON) === 0) {
							var  rmsg = adf.mf.internal.resource.getResourceStringImpl("ADFInfoBundle", "MSG_EL_PARSER_UNKNOWN_CHAR_FOUND", [":"]);
							
							this.parsingError(this.pos, rmsg);
						}

						this.addfunc(tokenStack, operatorStack, TOKEN_COLON);
						nooperands  += 2;
						expected     = (PRIMARY | LPAREN | UNIOP | SIGN);
					}
					else if (this.isVariable()) {
						if ((expected & PRIMARY) === 0) {
							var  rmsg = adf.mf.internal.resource.getResourceStringImpl("ADFInfoBundle", "MSG_EL_PARSER_UNEXPECTED_VARIABLE_FOUND");
							
							this.parsingError(this.pos, rmsg);
						}
						
						var vartoken = new Token(TOKEN_VARIABLE, this.token, 0, 0);
						tokenStack.push(vartoken);

						expected = (OPERATOR | HOOK | COLON | RPAREN | COMMA | LPAREN | LBRACE | CALL | CLOSEEXP);
					}
					else if (this.isString()) {
						if ((expected & PRIMARY) === 0) {
							var  rmsg = adf.mf.internal.resource.getResourceStringImpl("ADFInfoBundle", "MSG_EL_PARSER_UNEXPECTED_STRING_FOUND");
							
							this.parsingError(this.pos, rmsg);
						}
						token = new Token(TOKEN_CONSTANT, 0, 0, this.value);
						tokenStack.push(token);

						expected = (OPERATOR | HOOK | COLON | RPAREN | COMMA | CLOSEEXP);
					}
					else if (this.isWhitespace()) {
					}
					else {
						if (this.errormsg === "") {
							var  rmsg = adf.mf.internal.resource.getResourceStringImpl("ADFInfoBundle", "MSG_EL_PARSER_UNKNOWN_CHAR_FOUND", [this.expression.charAt(this.pos)]);
							
							this.parsingError(this.pos, rmsg);
						}
						else {
							this.parsingError(this.pos, this.errormsg);
						}
					}
				}
				if (insideExpression) {
					var  rmsg = adf.mf.internal.resource.getResourceStringImpl("ADFInfoBundle", "MSG_EL_PARSER_MISSING_ENDING");
					
					this.parsingError(this.pos, rmsg);
				}
				if (this.pmatch != 0) {
					var  rmsg = adf.mf.internal.resource.getResourceStringImpl("ADFInfoBundle", "MSG_EL_PARSER_MISMATCH");
					
					this.parsingError(this.pos, rmsg);
				}
				while (operatorStack.length > 0) {
					var tmp = operatorStack.pop();
					tokenStack.push(tmp);
				}
				if(tokenStack.length == 0) {
					token = new Token(TOKEN_CONSTANT, 0, 0, "");
					tokenStack.push(token);
				}
				if (nooperands + 1 !== tokenStack.length) {
					var  msg = "{";
					for(var i=0; i < tokenStack.length; ++i) {
						msg += " token["+i+"] = '" + tokenStack[i].toString() + "' ";
					}
					msg += "}";
					
					var  rmsg = adf.mf.internal.resource.getResourceStringImpl("ADFInfoBundle", "MSG_EL_PARSER_INCORRECT_OPERANDS", 
							                                                   [("[" + (nooperands + 1) + ", " + tokenStack.length + "]"), msg]);

					this.parsingError(this.pos, rmsg);
				}

				return new ELExpression(tokenStack, object(this.unaryOperations), object(this.binaryOperations), object(this.ternaryOperations), object(this.functions));
			},

			evaluate: function (expr, variables) {
				var /* ELExpression */ elExpr = this.parse(expr);
				var /* var array    */ vars   = [];
				var /* return value */ v;
				
				try
				{
					v = elExpr.evaluate(variables);
				}
				catch(e)
				{
					try 
					{
						vars = elExpr.dependencies();
					}
					catch(e2) 
					{
						vars = [];
					}
					vars.push(expr);
					
					var  rmsg = adf.mf.internal.resource.getResourceStringImpl("ADFInfoBundle", "MSG_EL_PARSER_UNABLE_TO_RESOLVE", [expr]);
					
					teval = {"msg": rmsg, "variables": vars};
					throw e;
				}
				return v;
			},

			parsingError: function (column, msg) {
				this.success = false;
				this.errormsg = adf.mf.internal.resource.getResourceStringImpl("ADFInfoBundle", "MSG_ERROR_IN_EL_PARSING", [msg, column, this.expression]);
				
				/* this is a huge issue, log a message in case the caller is not catching exceptions */
	            adf.mf.log.Framework.logp(adf.mf.log.level.SEVERE, "adf.mf.internal.el.parser", "EL Parser", this.errormsg);

				throw new adf.mf.ELException(this.errormsg);
			},
			
			addfunc: function (tokenStack, operatorStack, type) {
				var operator = new Token(type, this.token, this.prior - this.pmatch, 0);
				while (operatorStack.length > 0) {
					if (operator.prior >= operatorStack[operatorStack.length - 1].prior) {
						tokenStack.push(operatorStack.pop());
					}
					else {
						break;
					}
				}
				operatorStack.push(operator);
			},

			/**
			 * Used to update the internal ELParser's state 
			 * 
			 * @param element
			 * @param updatePosition
			 */
			updateState: function(element, updatePosition) {
				this.token = element[0];
				this.prior = element[4];
				
				if(updatePosition) {
					this.pos   += element[2];
				}
			},

			/**
			 * Determine if the next token is a constant literal.
			 * 
			 * @returns {Boolean}
			 */
			isConstant: function() {
				var str;
				
				for(c in this.constants) {
					if(c !== null) {
						var l = c.length;
						
						str = this.expression.substr(this.pos, l);
						if(c == str.toLowerCase()) {
							this.value = this.constants[c];
							this.pos  += l;
							return true;
						}
					}
				}
				return false;
			},

			/**
			 * Determine if the next token is a numeric literal.
			 * 
			 * @returns {Boolean}
			 */
			isNumber: function () {
				var result   = false;
				var buf      = [];
				var start    = this.pos;

                while (this.pos < this.expression.length) {
                  var c = this.expression.charCodeAt(this.pos);
                  /* Detect engineering number notation (e.g. 1.2E-3) */
                  /* This is necessary to allow expression like 12+34 */
                  var cprev = (this.pos > 0) ? this.expression.charCodeAt(this.pos-1) : null;
                  var isExponent = false;
                  if ((cprev == 69 /* E */) || (cprev == 101 /* e */))
                  {
                	  if(buf.length > 1) isExponent = true;
                	  else 
                	  {
                		  this.pos = start;  /* back up the postion to where we started */
                		  return false;
                	  }
                  }
 
                  if ((c >= 48 /* 0 */ && c <= 57 /* 9 */) || 
                      (isExponent == true && c == 43) /* e+ or E+ */ || 
                      (isExponent == true && c == 45) /* e- or E-*/ || 
                      c == 46 /* . */ || c == 69 /* E */  || c == 101 /* e */ ) 
                  {
                    buf.push(this.expression.charAt(this.pos));
                    result = true;
                  } 
                  else 
                  {
                    break;
                  }
                  this.pos++;
                }
				if(result) {
					var str = buf.join('');
					this.value = parseFloat(str);
				}
				return result;
			},

			/**
			 * Determine if the next token is a string literal.
			 * 
			 * @returns {Boolean}
			 */
			isString: function () {
				var result    = false;
				var str       = "";
				var startpos  = this.pos;
				var delims    = ["'", "\""];
				
				for(var t = 0; t < delims.length; ++t) {
					if (this.pos < this.expression.length && this.expression.charAt(this.pos) == delims[t]) {
						this.pos++;
						while (this.pos < this.expression.length) {
							var code = this.expression.charAt(this.pos);
							
							if (code != delims[t] || str.slice(-1) == "\\") {
								str += this.expression.charAt(this.pos);
								this.pos++;
							}
							else {
								this.pos++;
								this.value = this.unescape(str, startpos);
								result     = true;
								break;
							}
						}
					}
				}
				return result;
			},
			
			/**
			 * unescape an input string into a normal string
			 * 
			 * @param input string to unescape
			 * @param pos   in the overall expression we are unescaping
			 * 
			 * @returns the unescaped string
			 */
			unescape: function(input, pos) {
				var buf    = [];
				var escape = false;

				for (var i = 0; i < input.length; i++) {
					var c = input.charAt(i);
		
					if (! escape) {
						if (c == '\\') { /* turn on escaping */
							escape = true;
						} else {  /* non-escaped character, just add it to the buffer */
							buf.push(c);
						}
					} else { /* character following the escape character \\ */
						switch (c) {
						case "'":  buf.push("'");  break;
						case '\\': buf.push('\\'); break;
						case '/':  buf.push('/');  break;
						case 'b':  buf.push('\b'); break;
						case 'f':  buf.push('\f'); break;
						case 'n':  buf.push('\n'); break;
						case 'r':  buf.push('\r'); break;
						case 't':  buf.push('\t'); break;
						case 'u':  /* following 4 chars make up the hex code for the character */
							var unicodeCode = parseInt(input.substring(i+1, i+5), 16);
							buf.push(String.fromCharCode(unicodeCode)); // add the string representation of the unicode char 
							i += 4;
							break;						
						default:
							throw this.parsingError(pos + i, "Illegal escape sequence: '\\" + c + "'");
						}
						escape = false;
					}
				}
		
				return buf.join('');  /* convert the array to a single string */
			},

			/**
			 * Operators:
			 * In addition to the . and [] operators discussed in Variables, there is the additional operators:
			 * Arithmetic: +, - (binary), *, / and div, % and mod, - (unary)
			 * Logical: and, &&, or, ||, not, !
			 * Relational: ==, eq, !=, ne, <, lt, >, gt, <=, ge, >=, le. 
			 *          Comparisons can be made against other values, or against boolean, 
			 *          string, integer, or floating point literals.
			 * Empty: The empty operator is a prefix operation that can be used to determine whether a value is null or empty.
			 * Conditional: A ? B : C. Evaluate B or C, depending on the result of the evaluation of A.
			 *  
			 * @returns {Boolean}
			 */
			isOperator: function () {
				var matched   = null;			
				var tokendata = null;

				/* 
				 * note: the this.binaryOperations is the following format:
				 * token : [ token, function_to_perform, increment_position_by, prior_token ]
				 */
				for(var t in this.binaryOperations) {
					matched = true;
					
					/*
					 * Structure of the binary operators array: 
					 * [token, function_to_perform, increment_position_by, prior_token ]
					 */
					for(var i = 0; i < t.length; ++i) {
						var code   = this.expression.charCodeAt(this.pos + i);
						
						tokendata = this.binaryOperations[t];
						if(code != t.charCodeAt(i)) {
							matched = false;
							break;
						}
					}
					
					if(matched) {
						this.updateState(tokendata, true);
						return true;
					}
				}
				
				/* we did not match the token and we eat the character and return false */
				return false;
			},

			/**
			 * Determine if the next token is a sign token (- or +)
			 * 
			 * @returns {Boolean}
			 */
			isSign: function () {
				var code = this.expression.charCodeAt(this.pos - 1);
				return (code === 45 || code === 43); // - or +
			},

			/**
			 * Determine if the next token is a bang token (!)
			 * 
			 * @returns {Boolean}
			 */
			isBang: function () {
				var code = this.expression.charCodeAt(this.pos);
				if (code === 33) { // !
					this.pos++;
					this.prior = 3; 
					this.token = "!";
					return true;
				}
				return false;
			},

			/**
			 * Determine if the next token is a hook token (?)
			 * 
			 * @returns {Boolean}
			 */
			isHook: function () {
				var code = this.expression.charCodeAt(this.pos);
				if (code === 63) { // ?
					this.pos++;
					this.prior = 10;
					this.token = "?";
					return true;
				}
				return false;
			},

			/**
			 * Determine if the next token is a colon token (:)
			 * 
			 * @returns {Boolean}
			 */
			isColon: function () {
				var code = this.expression.charCodeAt(this.pos);
				if (code === 58) { // :
					this.pos++;
					this.prior = 10;
					this.token = ":";
					return true;
				}
				return false;
			},

			/**
			 * Determine if the next token is a positive sign token
			 * 
			 * @returns {Boolean}
			 */
			isPositiveSign: function () {
				return (this.expression.charCodeAt(this.pos - 1) === 43); // +
			},

			/**
			 * Determine if the next token is a negative sign token
			 * 
			 * @returns {Boolean}
			 */
			isNegativeSign: function () {
				return (this.expression.charCodeAt(this.pos - 1) === 45); // -
			},

			/**
			 * Determine if the next token is a left parenthesis token
			 * 
			 * @returns {Boolean}
			 */
			isLeftParenthesis: function () {
				var code = this.expression.charCodeAt(this.pos);
				if (code === 40) { // (
					this.pos++;
					this.pmatch += 100;
					return true;
				}
				return false;
			},
			
			/**
			 * Determine if the next token is a right parenthesis token
			 * 
			 * @returns {Boolean}
			 */
			isRightParenthesis: function () {
				var code = this.expression.charCodeAt(this.pos);
				if (code === 41) { // )
					this.pos++;
					this.pmatch -= 100;
					return true;
				}
				return false;
			},

			/**
			 * Determine if the next token is a left brace token
			 * 
			 * @returns {Boolean}
			 */
			isLeftBrace: function () {
				var code = this.expression.charCodeAt(this.pos);
				if (code === 91) { // [
					this.pos++;
					this.pmatch += 100;
					return true;
				}
				return false;
			},
			
			/**
			 * Determine if the next token is a right brace token
			 * 
			 * @returns {Boolean}
			 */
			isRightBrace: function () {
				var code = this.expression.charCodeAt(this.pos);
				if (code === 93) { // ]
					this.pos++;
					this.pmatch -= 100;
					return true;
				}
				return false;
			},

			/**
			 * Determine if the next token is a dot token
			 * 
			 * @returns {Boolean}
			 */
			isDot: function () {
				var code = this.expression.charCodeAt(this.pos);
				if (code === 46) { // .
					this.pos++;
					this.prior = 0;
					return true;
				}
				return false;
			},

			/**
			 * Determine if the next token is the open expression token
			 * 
			 * @returns {Boolean}
			 */
			isOpenExpression: function () {
				var code = this.expression.charCodeAt(this.pos);
				if ((code === 123) && (this.directive+1 == this.pos)){ // {
					// this.pos++;
					return true;
				}
				return false;
			},
			
			/**
			 * Determine if the next token is the close expression token
			 * 
			 * @returns {Boolean}
			 */
			isCloseExpression: function () {
				var code = this.expression.charCodeAt(this.pos);
				if (code === 125) { // }
					this.pos++;
					return true;
				}
				return false;
			},
			
			
			/**
			 * Determine if this is a expression directive.
			 * 
			 * @returns {Boolean}
			 */
			isExpressionDirective: function () {
				var status = false;
				var code   = this.expression.charCodeAt(this.pos);
				
				if ((code === 35 /* # */) || (code === 36 /* $ */)) {
					this.directive = this.pos;
					status         = true;
				}
				return status;
			},

			/**
			 * Determine if the next token is a comma token
			 * 
			 * @returns {Boolean}
			 */
			isComma: function () {
				var code = this.expression.charCodeAt(this.pos);
				if (code === 44) { // ,
					this.pos++;
					this.prior = -1;
					this.token = ",";
					return true;
				}
				return false;
			},

			/**
			 * Determine if the next token is whitespace
			 * 
			 * @returns {Boolean}
			 */
			isWhitespace: function () {
				var code = this.expression.charCodeAt(this.pos);
				if (code === 32 /* space */ || 
					code ===  9 /* tab   */ || 
					code === 10 /* LF    */ || 
					code === 13 /* CR    */) {
					this.pos++;
					return true;
				}
				return false;
			},

			/**
			 * Determine if the next token is an operation token.
			 * 
			 * @param operationMap i.e. unary, binary, or ternary operation map
			 * 
			 * @returns {Boolean}
			 */
			isOperationToken: function (operationMap) {
				var str = "";
				for (var i = this.pos; i < this.expression.length; ++i) {
					var c = this.expression.charAt(i);  /* use chars not unicodes so we can do the Upper/Lower trick */
					if (c.toUpperCase() === c.toLowerCase()) {
						if (i === this.pos || c < '0' || c > '9') {
							if (i === this.pos) str = c;
							break;
						}
					}
					str += c;
				}
				if (str.length > 0 && (str in operationMap)) {
					this.token = str;
					this.prior = operationMap[str][4];  /* adding precedence support */
					this.pos  += str.length;
					return true;
				}
				return false;
			},

			/**
			 * Determine if the next token is a variable token
			 * 
			 * @returns {Boolean}
			 */
			isVariable: function () {
				var str       = "";
				var length    = 0;
				
				for (var i = this.pos; i < this.expression.length; i++) {
					var c           = this.expression.charAt(i);
					var includeChar = true;
					
					/* see if this character is not a valid character for a name */
					if(str === "") {
						/* first character must be alpha except for compressed keys
						 * which will start with _ (and be in the form of _999) 
						 */
						if((c.toLowerCase() == c.toUpperCase()) && (c !== '_')) {
							break;
						}
					} 
					
					if(c.toLowerCase() == c.toUpperCase()) { 
						if(((c >= '0') && (c <= '9')) ||    /* numbers are validate             */
						   ((c == '.') || (c == '_'))) {    /* dot and underscore are also okay */
					    }else break;
					}
					
					length++;
					if(includeChar) {
						str += c;
					}
				}
				if (str.length > 0) {
					this.token  = str;
					this.prior  = 3;
					this.pos   += length; // str.length;
					return true;
				}
				return false;
			},

			/**
			 * Determine if the next token is a comment token.
			 * 
			 * @returns {Boolean}
			 */
			isComment: function () {
				/* 
				 * remember we need to look back one character for the slash since it might
				 * have been picked up as a unary or binary operation token.
				 */
				var code = this.expression.charCodeAt(this.pos - 1);
				
				if ((code === 47 /* slash */) && (this.expression.charCodeAt(this.pos) === 42 /* start */)) {
					this.pos = this.expression.indexOf("*/", this.pos) + 2; /* eat all those characters */
					
					if (this.pos === 1) {
						this.pos = this.expression.length;
					}
					return true;
				}
				return false;
			}
		};
		
		function escape(v) {
			var    quote = "\""; // "'";
		    escapable = /[\\\'\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
		    meta      = { '\b': '\\b','\t': '\\t','\n': '\\n','\f': '\\f','\r': '\\r',"'" : "\\'",'\\': '\\\\' };
			if ((typeof v) === "string") {
				escapable.lastIndex = 0;
		        return escapable.test(v) ?
		        		quote + v.replace(escapable, function (a) {
			                var c = meta[a];
			                return ((typeof c === 'string')? c :
			                    '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4));
			            }) + quote :
			            quote + v + quote;
			}
			return v;
		}

		return ELParser;
	}();
})();


/////////////////////////////////////// end of /Users/buildprocess/HudsonHome/jobs/adfmf-v11-11.1.2.4.1-tip/workspace/Container/JavaScript/ADF/js/ELParser.js///////////////////////////////////////



/////////////////////////////////////// start of /Users/buildprocess/HudsonHome/jobs/adfmf-v11-11.1.2.4.1-tip/workspace/Container/JavaScript/ADF/js/TreeNode.js///////////////////////////////////////

// @requires ELErrors
// @requires ArrayELResolver
// @requires MapELResolver
// @requires CompositeELResolver
// @requires JavaScriptExpressionFactory
// @requires ValueExpression
// @requires ValueReference
// @requires AdfPerfTiming

// @requires RootPropertyELResolver
// @requires JavaScriptContext


var adf                    = window.adf                 || {};
adf.mf                     = adf.mf                     || {};
adf.mf.api                 = adf.mf.api                 || {};
adf.mf.el                  = adf.mf.el                  || {};
adf.mf.locale              = adf.mf.locale              || {};
adf.mf.log                 = adf.mf.log                 || {};
adf.mf.resource            = adf.mf.resource            || {};
adf.mf.util                = adf.mf.util                || {};

adf.mf.internal            = adf.mf.internal            || {};
adf.mf.internal.api        = adf.mf.internal.api        || {};
adf.mf.internal.el         = adf.mf.internal.el         || {};
adf.mf.internal.el.parser  = adf.mf.internal.el.parser  || {};
adf.mf.internal.locale     = adf.mf.internal.locale     || {};
adf.mf.internal.log        = adf.mf.internal.log        || {};
adf.mf.internal.mb         = adf.mf.internal.mb         || {};
adf.mf.internal.perf       = adf.mf.internal.perf       || {};
adf.mf.internal.perf.story = adf.mf.internal.perf.story || {};
adf.mf.internal.resource   = adf.mf.internal.resource   || {};
adf.mf.internal.util       = adf.mf.internal.util       || {};


(function() {
	function TreeNode(/* TreeBinding */ tb, /* index */ index)
	{
		this.id       = tb.id;
		this.index    = index;
		this.modid    = adf.mf.internal.context.getModId();
                
		this.getAlias = function(/* boolean */ compressed)
		{
			var cond    = compressed || false;
			var ref     = this.id + ".collectionModel.treeNodeBindings.providers['" + this.getKey() + "']";
			var alias   = (cond)? adf.mf.internal.api.addCompressedReference(ref) : ref;
			
			adf.mf.log.Framework.logp(adf.mf.log.level       .FINE, "TreeNode", "getAlias", 
					                  "alias="+alias+" expanded="+ref);
			return alias;
		};

		/**
		 * INTERNAL function to get the current collection
		 * model stored for the given tree binding's id.
		 */
		this.getTreeNodeBindings = function()
		{
      /* check to see if we already have the latest tree node bindings */
      if(this.modid == adf.mf.internal.context.getModId()) {
        return tb.treeNodeBindings;
      }
      else 
      { /* looks like the cache has been updated, be safe re-fetch */
        var cm = adf.mf.api.getLocalValue("#{" + this.id + ".collectionModel}");
				
        return (cm.treeNodeBindings || {});		
      }
		};
		this.tnb = this.getTreeNodeBindings();
		
		/**
		 * getProvider will update the current provider
		 * reference and return it's value to the caller.
		 */
		this.getProvider   = function()
		{
			var  key      = this.getKey();
			
			this.provider = (key != undefined)? this.tnb.providers[key] : undefined;
			
			return this.provider;
		};
		
		/**
		 * getBindings will return the associated
		 * column bindings to the caller. 
		 */
		this.getBindings   = function()
		{
			return this.tnb.columnBindings;
		};
		
		/*
		 * get the current key value
		 */
		this.getKey = function()
		{
	        this.key  = ((index < 0) || (index >= this.tnb.keys.length))? undefined : this.tnb.keys[index];
			
			return this.key;
		};
		
		this.rowKey = function()
		{
			return this.getKey();
		};

		this.provider = this.getProvider();
		this.key      = this.getKey();
		this.note     = '' + (typeof this) + ' with EL variable id: ' + this.id + ' on index ' + this.index;
		this['.type'] = 'oracle.adfmf.bindings.dbf.TreeNode';
	};

	
	/**
	 * 
	 * Here are some things to note about using the iterator.
	 * 
	 * Step  1. Resolve #{bindings.products.collectionModel}
	 *          adf.mf.api.getValue("#{bindings.products.collectionModel}",
	 *                          function(a,b) {value = b[0].value; success();}, failed);
	 * 
	 * Step  2. Resolve #{bindings.products.collectionModel.iterator}
	 *          adf.mf.api.getValue("#{bindings.products.collectionModel.iterator}",
	 *                          function(a,b) {bpci = b[0].value; success();}, failed);
	 * 
	 * Step 3.  Jumping around the rows with the iterator
	 *          Resolve iterator.first():
	 *          bpci.first(function(a, b){ adf.mf.api.addVariable('row', b[0].value); success(); }, failed);
	 * 
	 *          Resolve iterator.last():
	 *          bpci.first(function(a, b){ adf.mf.api.addVariable('row', b[0].value); success(); }
	 *                                function(a, b){ failed();});
	 *                                
	 *          Resolve iterator.previous():
	 *          bpci.previous(function(a, b){ adf.mf.api.addVariable('row', b[0].value); success(); }, failed);
	 *                                
	 *          Resolve iterator.next():
	 *          bpci.next(function(a, b){ adf.mf.api.addVariable('row', b[0].value); success(); }, failed);
	 * 
	 * Step  4. Accessing iterator bindings:
	 *          Resolve #{row.bindings}:
	 *          adf.mf.api.getValue("#{row.bindings}",
	 *                          function(a,b) {value = b[0].value; success();},
	 *                          function(a,b) {showFailure("unable to resolve"); failure();});
	 * 
	 *          Resolve #{row.bindings.name}:
	 *          adf.mf.api.getValue("#{row.bindings.name}",
	 *                          function(a,b) {value = b[0].value; success();},
	 *                          function(a,b) {showFailure("unable to resolve");});
	 * 
	 *          Resolve #{row.bindings.name.inputValue}:"
	 *                     adf.mf.api.getValue("#{row.bindings.name.inputValue}",
	 *                                     function(a,b) {value = b[0].value; success();},
	 *                                     function(a,b) {showFailure("unable to resolve"); failure();});
	 * 
	 *          Update #{row.bindings.name.inputValue}:"+ stringify(value) + "");
	 *                     adf.mf.api.setValue({'name':"#{row.bindings.name.inputValue}", 'value':value}, 
	 *                                      function() {showSuccess("Updated"); success();},
	 *                                      function() {showFailure("Unable to updated");});
	 * 
	 *          Resolve #{row.dataProvider}:
	 *          adf.mf.api.getValue("#{row.dataProvider}", 
	 *                          function(a,b) {value = b[0].value; success();}, 
	 *                          function(a,b) {showFailure("unable to resolve"); failure();});
	 *             
	 *          Resolve #{row.dataProvider}:
	 *          adf.mf.api.getValue("#{row.dataProvider.name}", 
	 *                          function(a,b) {value = b[0].value; success();}, 
	 *                          function(a,b) {showFailure("unable to resolve"); failure();});
	 * 
	 *          Update #{row.dataProvider.name}:
	 *          adf.mf.api.setLocalValue({'name':"#{row.dataProvider.name}", 'value':value}, 
	 *                               function() {showSuccess("Updated"); success();},
	 *                               function() {showFailure("Unable to updated"); failure();});
	 * 
	 * Step 5: Register some data change listeners on #{bindings.products.collectionModel}:
	 *         adf.mf.api.addDataChangeListeners("#{bindings.products.collectionModel}", 
	 *                                            function(v) {showChangeEvent("DCN 1 of " + stringify(v));});
	 *         adf.mf.api.addDataChangeListeners("#{bindings.products.collectionModel}", 
	 *                                            function(v) {showChangeEvent("DCN 2 of " + stringify(v));});
	 *         adf.mf.api.addDataChangeListeners("#{bindings.products.collectionModel}", 
	 *                                            function(v) {showChangeEvent("DCN 3 of " + stringify(v));});
	 * 
	 * Step 6. Access the number of cached rows:
	 *         var cr = bpci.getCachedRowCount(0);
	 *         
	 * Step 7. Access the number of rows in a Range Size:
	 *         var rs = bpci.getRangeSize();
	 *         
	 * Step 8. Validating the data change event was processed correctly: ");
	 *         {
	 *            bpci.first(loopBody, function(e){ console.log("Error: first failed: " + stringify(e));});
	 *            ...
	 *         }
	 *         ...
	 *         
	 *         // Easy way to loop thru the number of rows we have cached starting at 0 
	 *         function loopBody()
	 *         {
	 *            if(++count < bpci.getCachedRowCount(0))
	 *            {
	 *               var v1 = adf.mf.api.getLocalValue("id:#{row.bindings.id.inputValue}");
	 *               var v2 = adf.mf.api.getLocalValue("name:#{row.bindings.name.inputValue}");
	 *                     
	 *               content += "checking provider[" + bpci.index + "] = [" + v1 + "]:" + v2 + "<br>"; 
	 * 
	 *               bpci.next(function(a, b){ adf.mf.api.addVariable('row', b[0].value); loopBody(); },
	 *                         function(a, b){ showSuccess("no more records to check"); showContent();});
	 *             }                
	 *         }
	 **/
	function TreeNodeIterator(/* TreeBinding */ tb, /* index */ idx)  
	{
		this.id                         = tb.id;
		this.treeNodeBindings           = tb.treeNodeBindings  || {providers:{}, keys:[]};
		this.index                      = idx;
		this.currentKey                 = null;
		this[".type"]                   = "TreeNodeIterator";  /* needed for minimized version to obtain the type */
		this.modid                      = adf.mf.internal.context.getModId();
	
		
		/**
		 * INTERNAL function to get the current collection
		 * model stored for the given tree binding's id.
		 */
		this.getTreeNodeBindings = function()
		{
			/* check to see if we already have the latest tree node bindings */
			if(this.modid == adf.mf.internal.context.getModId()) {
				return tb.treeNodeBindings;
			}
			else { /* looks like the cache has been updated, be safe re-fetch */
				var cm = adf.mf.api.getLocalValue("#{" + this.id + ".collectionModel}");
				
				return (cm.treeNodeBindings || { providers:{}, keys:[]});		
			}
		};

		
		/**
		 * create a new provider
		 */
		this.createRow = function(provider, /* boolean */ insertFlag, success, failed) 
		{
			return adf.mf.api.invokeMethod("oracle.adfmf.bindings.iterator.IteratorHandler", "create",
					                       this.id, this.currentKey, provider, insertFlag,
					                       success, failed);
		};

		/**
		 * fetch the first row in the collection
		 */
		this.first = function(success, failed) 
		{
			this.fetch(0, success, failed);
		};
		
		/**
		 * @returns the current row index
		 */
		this.getCurrentIndex = function() 
		{
			return this.index;
		};

		/**
		 * @returns the current row key
		 */
		this.getCurrentKey = function() 
		{
			return this.currentKey;
		};

		/**
		 * @returns the current provider (row)
		 */
		this.getCurrentRow = function() 
		{
			var tnb = this.getTreeNodeBindings();
			
			return (this.currentKey !== undefined)? 
					tnb.providers[this.currentKey]: undefined;
		};

		/**
		 * @returns true if their are more records buffered that can be read
		 */
		this.hasNext = function() 
		{
			var tnb = this.getTreeNodeBindings();
			
			return (this.index < (tnb.keys.length - 1));
		};

		/**
		 * @returns true if their are more records buffered that can be read
		 */
		this.hasPrevious = function() 
		{
			return (this.index > 0);
		};

		/**
		 * fetch the last row in the collection
		 */
		this.last = function(success, failed) 
		{
			var tnb = this.getTreeNodeBindings();
			
			this.fetch((tnb.keys.length - 1), success, failed);
		};

		/**
		 * obtain the next record in the collection
		 */
		this.next = function(success, failed) 
		{
			// adf.mf.log.Framework.logp(adf.mf.log.level.FINE, "TreeNodeIterator", "next", 
	        //           "Range Size: " + this.getRangeSize() + " where we have loaded " + this.getCachedRowCount(this.index) + " rows.");
			this.fetch((this.index + 1), success, failed);
		};
		
		/**
		 * fetch the first row in the collection
		 */
		/* provider */
		this.localFirst = function() 
		{
			return this.localFetch(0);
		};
		
		/**
		 * fetch the last row in the collection
		 */
		/* provider */
		this.localLast = function() 
		{
			var tnb = this.getTreeNodeBindings();
			
			return this.localFetch((tnb.keys.length - 1));
		};

		/**
		 * get the next provider if you have it already cached, if not will return undefined
		 */
		/* provider */
		this.localNext = function()
		{
			return this.localFetch((this.index + 1));
		};

		/**
		 * get the previous provider if you have it already cached, if not will return undefined
		 */
		/* provider */
		this.localPrevious = function()
		{
			return this.localFetch((this.index - 1));
		};
		
		/**
		 * request the next set of records to be fetched
		 */
		this.nextSet = function(success, failed) 
		{
			this.fetchSet('next', this.index, success, failed);
		};

		/**
		 * obtain the next record in the collection
		 */
		this.previous = function(success, failed) 
		{
			this.fetch((this.index - 1), success, failed);
		};

		/**
		 * request the previous set of records to be fetched
		 */
		this.previousSet = function(success, failed) 
		{
			this.fetchSet('previous', this.index, success, failed);
		};

		/**
		 * request the current record set to be re-fetched
		 */
		this.refresh = function(success, failed) 
		{
			this.fetchSet('next', this.index, success, failed);
		};

		/**
		 * set the current index for the iterator
		 * 
		 * @throws IllegalArgumentException if the index is out of range
		 */
		this.setCurrentIndex = function(/* int */ index) 
		{
			var tnb = this.getTreeNodeBindings();
			
			if((index < 0) || (index > (tnb.keys.length - 1)))
			{
				this.index      = -1;
				this.currentKey = undefined;
			}
			
			this.index      = index;
			this.currentKey = tnb.keys[index];
		};
		
		
		/**
		 * @return the number of contiguously loaded row starting at a given point.
		 * 
		 * @param startingAtIndex
		 */
		/* int */
		this.getCachedRowCount = function(/* int */ startingAtIndex)
		{
			var count = 0;
			var tnb   = this.getTreeNodeBindings();
            
            if((startingAtIndex < 0) || 
               (startingAtIndex > (tnb.keys.length - 1)))
            {
                return 0;
            }
			
			// adf.mf.log.Framework.logp(adf.mf.log.level.FINE, "TreeNodeIterator", "getCachedRowCount", "Passed the first test.");
			for(var i = startingAtIndex; i < tnb.keys.length; ++i)
			{
				var k = tnb.keys[i];
				
				// adf.mf.log.Framework.logp(adf.mf.log.level.FINE, "TreeNodeIterator", "getCachedRowCount", "index: " + i + "  key: " + k);
				
				if(tnb.providers[k] != undefined) ++count;
                else break;
			}
			
			return count;
		};
		
		
		/**
		 * @return the number of rows in a given range
		 */
		/* int */
		this.getRangeSize = function()
		{
			var sz = adf.mf.api.getLocalValue("#{" + this.id + ".IterBinding.RangeSize}");
			return (sz == undefined)? 0 : sz;
		};
		
		
		/***** internal methods *****/

		/**
		 * fetch the first row in the collection
		 */
		this.fetch = function(index, success, failed) 
		{
			var tnb = this.getTreeNodeBindings();
			
			this.setCurrentIndex(index);
			
			if(this.currentKey !== undefined)
			{
				if(tnb.providers[this.currentKey] === undefined)
				{
					if(adf.mf.log.Framework.isLoggable(adf.mf.log.level.FINE)) 
					{
						adf.mf.log.Framework.logp(adf.mf.log.level.FINE, "TreeNodeIterator", "fetch",
						                       ("no provider present for the key " + this.currentKey + 
						                        " need to fetch the value."));
					}
					this.fetchProviderByKey(this.currentKey, this.index, success, failed);
				}
				else
				{
					if(adf.mf.log.Framework.isLoggable(adf.mf.log.level.FINE)) 
					{
						adf.mf.log.Framework.logp(adf.mf.log.level.FINE, "TreeNodeIterator", "fetch",
						                       ("we have a provider for key " + this.currentKey + 
						                       " = " + adf.mf.util.stringify(tnb.providers[this.currentKey])));
					}
					this.returnProvider(this.currentKey, new TreeNode(tb, this.index), success);
				}
			}
			else
			{
				if(adf.mf.log.Framework.isLoggable(adf.mf.log.level.FINE)) 
				{
					adf.mf.log.Framework.logp(adf.mf.log.level.FINE, "TreeNodeIterator", "fetch",
					                       "no element found");
				}
				this.returnProvider(undefined, undefined, failed);
			}
		};
		
		/**
		 * fetch a row in the collection
		 */
		/* provider */
		this.localFetch = function(index) 
		{
			var tnb      = this.getTreeNodeBindings();
			var  oldIndex = this.index;
			
			this.setCurrentIndex(index);
			
			if(this.currentKey !== undefined)
			{
				if(tnb.providers[this.currentKey] !== undefined)
				{
					if(adf.mf.log.Framework.isLoggable(adf.mf.log.level.FINE)) 
					{
						adf.mf.log.Framework.logp(adf.mf.log.level.FINE, "TreeNodeIterator", "fetch",
						                       ("we have a provider for key " + this.currentKey + 
						                       " = " + adf.mf.util.stringify(tnb.providers[this.currentKey])));
					}
					return new TreeNode(tb, this.index);
				}
			}
			
			this.setCurrentIndex(oldIndex);  /* move the cursor back to where it was first */
			return undefined;
		};
		
		
		this.getKeys = function(success, failed)
		{
			var cm = adf.mf.api.getLocalValue("#{" + this.id + ".collectionModel}");;
			
			return adf.mf.api.invokeMethod("oracle.adfmf.bindings.iterator.IteratorHandler", "getKeys",
	                                        this.id,
	                                        [function(a,b) { cm.treeNodeBindings.keys = b; }, 
	                                        success], failed);
		};

		/**
		 * remove the current row (provider)
		 */
		this.removeCurrentRow = function(success, failed) 
		{
			var tnb       = this.getTreeNodeBindings();
			var removeKey = this.currentKey;
			var range     = 0;
			var newIndex  = this.index;
			
			/* first lets remove the key in the JavaScript cached collection model */
			for(var i = 0; i < tnb.keys.length; ++i)
			{
				if(tnb.keys[i] === this.currentKey)
				{
					tnb.keys.splice(i, 1);
					break;
				}
			}
			
			range = tnb.keys.length - 1;
			if(newIndex == range)
			{   /* we removed the last one, so move the index to the new last */
				newIndex = (range - 1);
			}
			if(range < 0)
			{  /* there are no elements in the collection any more */
				this.index      = -1;
				this.currentKey = undefined;
			}
			else
			{
				this.setCurrentIndex(newIndex);
			}
			
			return adf.mf.api.invokeMethod("oracle.adfmf.bindings.iterator.IteratorHandler", "removeRowWithKey",
					                       this.id, removeKey, success, failed);
		};
		
    this.setCurrentRowKey = function(key)
    {
      var i = this.treeNodeBindings.keys.indexOf(key);
      if (i != -1) {
        this.index = i;
        this.currentKey = key;
        return true;
      }
      return false;
    };

      
		this.setCurrentRowWithKey = function(key, success, failed)
		{
			var tnb      = this.getTreeNodeBindings();
			var newIndex = -1;
			
			for(var i = 0; i < tnb.keys.length; ++i)
			{
				if(tnb.keys[i] === key)
				{
					newIndex = i;
					break;
				}
			}
			if(newIndex != -1)
			{
				this.setCurrentIndex(newIndex);
				
				adf.mf.api.invokeMethod("oracle.adfmf.bindings.iterator.IteratorHandler", "setCurrentRowWithKey",
	                                    this.id, key, success, failed);
			}
			else
			{
				if(adf.mf.log.Framework.isLoggable(adf.mf.log.level.FINE)) 
				{
					adf.mf.log.Framework.logp(adf.mf.log.level.FINE, "TreeNodeIterator", "setCurrentRowWithKey",
					                       ("unable to find the key to set the current row to."));
				}
			}
		};
		
		
		/* ---------- internal callback functions ------------- */

		this.fetchSet = function(pcns, index, success, failed)
		{
			var cm    = adf.mf.api.getLocalValue("#{" + this.id + ".collectionModel}");
			var scb   = [];
			var fcb   = [];		
			var op    = "oracle.adfmf.bindings.iterator.IteratorHandler:fetchSetRelativeTo";
			var upf   = this.updateProviders;
			var start = adf.mf.internal.perf.start(op);
	        
			scb = scb.concat([function(a,b) { adf.mf.internal.perf.stop(op);
			                                  adf.mf.internal.perf.start("adf.mf.api.TreeNodeIterator.updateProviders");
	                                          upf(cm, b); 
	                                          adf.mf.internal.perf.stop("adf.mf.api.TreeNodeIterator.updateProviders"); }]);
			scb = scb.concat(adf.mf.internal.util.is_array(success)? success : [success]);
	        
			fcb = fcb.concat([function(a,b) { adf.mf.internal.perf.stop(op);
                                              adf.mf.log.logInfoResource("ADFInfoBundle", adf.mf.log.level.WARNING, "TreeNodeIterator.fetchSet", "MSG_UNABLE_TO_FETCH_SET", adf.mf.util.stringify(arguments)); }]);
			fcb = fcb.concat(adf.mf.internal.util.is_array(failed)?  failed  : [failed ]);
			
			/* pcns: previous, current, or next set */
			return adf.mf.api.invokeMethod("oracle.adfmf.bindings.iterator.IteratorHandler", "fetchSetRelativeTo",
	                                       this.id, pcns, cm.treeNodeBindings.keys[index], scb, fcb);
		};
		
		/* ---------- internal callback functions ------------- */
		this.fetchProviderByKey = function(key, index, success, failed)
		{
			var rpf = this.returnProvider;
			
			this.fetchSet("next", index, 
					      function(a,b) { rpf(key, new TreeNode(tb, index), success); }, 
	                      failed);
		};
		
		
		this.updateKeys = function(keys)
		{
			try
			{
				var cm = adf.mf.api.getLocalValue("#{" + this.id + ".collectionModel}");
				cm.treeNodeBindings.keys = keys;
			}
			catch(e)
			{
                adf.mf.log.logInfoResource("ADFInfoBundle", adf.mf.log.level.SEVERE, "TreeNodeIterator.updateKeys", "MSG_ERROR_TREENODEITERATOR_UPDATE_KEYS", this.id, e);                                       
			}
		};
		
		this.updateProviders = function(cm, values)
		{
			var providers = values || {};
			var keys      = [];
			
			if(cm === undefined)
			{
                adf.mf.log.logInfoResource("ADFInfoBundle", adf.mf.log.level.SEVERE, "TreeNodeIterator.updateProviders", "MSG_ERROR_TREENODEITERATOR_UPDATE_PROVIDERS");                                       
			}
			else
			{
				for(var p in providers)
				{
					if(p !== undefined)
					{
						cm.treeNodeBindings.providers[p] = providers[p];		
					}
				}
			}
		};



		this.returnProvider = function(name, provider, callback)
		{
			var request  = [{ 'name':name}];
			var response = [{ 'name':name, 'value': provider }];
			
			if(adf.mf.internal.util.is_array(callback))
			{
				var count = callback.length;
				
				for(var i = 0; i < count; ++i)
				{
					callback[i](request, response);
				}
			}
		    else
		    {
				callback(request, response);
		    }
		};
	};
	
	adf.mf.internal.el.TreeNode   = TreeNode;
	adf.mf.el.TreeNodeIterator    = TreeNodeIterator;
})();




/////////////////////////////////////// end of /Users/buildprocess/HudsonHome/jobs/adfmf-v11-11.1.2.4.1-tip/workspace/Container/JavaScript/ADF/js/TreeNode.js///////////////////////////////////////



/////////////////////////////////////// start of /Users/buildprocess/HudsonHome/jobs/adfmf-v11-11.1.2.4.1-tip/workspace/Container/JavaScript/ADF/js/Adfel.js///////////////////////////////////////

// @requires ELErrors
// @requires ArrayELResolver
// @requires MapELResolver
// @requires CompositeELResolver
// @requires JavaScriptExpressionFactory
// @requires ValueExpression
// @requires ValueReference

// @requires RootPropertyELResolver
// @requires JavaScriptContext

// @requires ELParser
// @requires TreeNode
// @requires Utilities
// @requires AdfPerfTiming
// @requires AdfResource
// @requires AdfLocale

var PERFMON    = true;

var adf                    = window.adf                 || {};
adf.mf                     = adf.mf                     || {};
adf.mf.api                 = adf.mf.api                 || {};
adf.mf.el                  = adf.mf.el                  || {};
adf.mf.locale              = adf.mf.locale              || {};
adf.mf.log                 = adf.mf.log                 || {};
adf.mf.resource            = adf.mf.resource            || {};
adf.mf.util                = adf.mf.util                || {};

adf.mf.internal            = adf.mf.internal            || {};
adf.mf.internal.api        = adf.mf.internal.api        || {};
adf.mf.internal.el         = adf.mf.internal.el         || {};
adf.mf.internal.el.parser  = adf.mf.internal.el.parser  || {};
adf.mf.internal.locale     = adf.mf.internal.locale     || {};
adf.mf.internal.log        = adf.mf.internal.log        || {};
adf.mf.internal.mb         = adf.mf.internal.mb         || {};
adf.mf.internal.perf       = adf.mf.internal.perf       || {};
adf.mf.internal.perf.story = adf.mf.internal.perf.story || {};
adf.mf.internal.resource   = adf.mf.internal.resource   || {};
adf.mf.internal.util       = adf.mf.internal.util       || {};



adf.mf.internal.api.constants = adf.mf.internal.api.constants || {
	'KEY_PROPERTY'            : '.key',
	'NULL_FLAG_PROPERTY'      : '.null',
	'TYPE_PROPERTY'           : '.type',
	'TRANSIENT_FLAG_PROPERTY' : '.transient',
	'EXCEPTION_FLAG_PROPERTY' : '.exception',
	'VALUE_REF_PROPERTY'      : '.valueref',
	'WEAK_REFERENCE_PROPERTY' : '.weakref',
	'DEFERRED_PROPERTY'       : '.deferred'
};

(function() {
	/**
	 * The JavaScriptContext is basic the javascript model layer.  It is an EL
	 * context for javascript.  So things like root level variables, functions,
	 * .. as well as wrapping the VMChannel and other base platform items.
	 */
	adf.mf.internal.context = new adf.mf.internal.el.JavaScriptContext();

	/**
	 * The JavaScriptExpressionFactory is the EL expression factory for javascript.
	 */
	var factory             = new adf.mf.el.JavaScriptExpressionFactory();

	/**
	 * Define a 'default' binding instance
	 */
	var bindingInstances    = {};

	/**
	 * Topic: Understanding_DataChangeListeners:
	 *
	 * There is one dataChangeListener for EACH individual variable we are monitoring for
	 * changes.  So for the EL Expression #{a + b} there would be two dataChangeListeners
	 * (one for 'a' and one for 'b').  Each of these dataChangeListers records are handled
	 * independently, since we might actually be monitoring 'a' or 'b' already or as part
	 * of another expression.  The dataChangeListeners record contains two arrays; one for
	 * the all the unique IDs (EL Expressions) that we should be listening on, and one for
	 * the callbacks to notify.
	 *
	 * Given that, when a data change listener (via addDataChangeListener) is registered,
	 * the EL Expression is decomposed into all of it's individual variables where each
     * variable get their own dataChangeListner record.  So given the above EL Expression
     * (#{a + b}), there is an 'a' DCL and a 'b' DCL that would look something like this:
     *
	 *   dataChangeListeners["a"] = { "id":["#{a + b}"] "callback":[function() {...}] }
	 *   dataChangeListeners["b"] = { "id":["#{a + b}"] "callback":[function() {...}] }
	 *
	 * now if we then register the EL Expression #{a + c}, we would get something like this:
	 *
	 *   dataChangeListeners["a"] = { "id":["#{a + b}", "#{a + c}"]
	 *                                "callback":[function() {...}, function() {...}] }
	 *   dataChangeListeners["b"] = { "id":["#{a + b}"] "callback":[function() {...}] }
	 *   dataChangeListeners["c"] = { "id":["#{a + c}"] "callback":[function() {...}] }
	 *
	 * Notice how the dataChangeListeners["a"]'s id and callback array grew and the
	 * inclusion of the "c" dataChangeListener record.
	 *
	 * Now, when some data is changed in the CVM layer a data change event (DCE) is raised
	 * and passed back on a VMChannel response message.  The native container framework then
	 * pulls this DCE off the response and passes it to (javascript) processDataChangeEvent.
	 * In this javascript function the DCE is disected and for each and every variable/provider
	 * change in the DCE the following is done:
	 *   1. data is updated in the JavaScriptContext
	 *   2. determine if any registered data change listeners exists for that variable or provider.
	 *      This is done by simply looking up the variable name in the dataChangeListeners map
	 *      (i.e. name->dataChangeListeners records (described above)).
	 *
	 * Since the data change listener record contains all the registered ELs (id) and handlers
	 * (callback), we simply send a notification to all the handlers with each of the registered
	 * EL Expression (id in the code).
	 *
	 * So if we code that looked like this:
	 *  adf.mf.api.addDataChangeListeners("#{a}",   fa);   // 1
	 *  adf.mf.api.addDataChangeListeners("#{!a}",  fna);  // 2
	 *  adf.mf.api.addDataChangeListeners("#{b}",   fb);   // 3
	 *  adf.mf.api.addDataChangeListeners("#{a+b}", fab);  // 4
	 *
	 * Then we receive a data change event for a, then following notifications would
	 * be emitted:
	 *   fa(#{a})    // registered by line 1
	 *   fna(#{!a})  // registered by line 2
	 *   fab(#{a+b}) // registered by line 4
	 * If we then recieve a data change event fo b, these notifications would be emitted:
	 *   fb(#{b})    // registered by line 3
	 *   fab(#{a+b}) // registered by line 4
	 *
	 * To unregister a data change listener simply call adf.mf.api.removeDataChangeListeners
	 * i.e.
	 *   adf.mf.api.removeDataChangeListeners("#{a+b}") // remove the line 4 listener
	 *
	 *
	 * In addition to the data change listeners for individual EL expressions, one can register for
	 * a bulk notification mechanism.  In this case, the framework will not attempt to map individual
	 * ELs to specific callback, instead the registered callback(s) will be invoked with the list of
	 * ELs that where changed.  This 'bulk' mechanism has some PROs and CONs.  It provides a single
	 * notification with all the changed ELs allowing the handler to process all the changes in a single
	 * call (allowing a single update event for multiple changes in components like a table).  However,
	 * it does place the work of filtering/routing EL changes to the proper sub-component.
	 *
	 * NOTE: The providers detail will only contain itemized changes provided the 'itemized'
	 *       property exists and is true.  Otherwise the entire collection model should be
	 *       updated since no detailed information is known.  This detailed information is
	 *       delivered as a map with the collection model id being the key.  The value of the
	 *       property will be a provider change record in the following format:
	 *
	 *       {
	 *         bindings.notes.collectionModel: {
	 *           itemized: true;
	 *           created: [0: {key: UID-3464; }];
	 *           updated: [];
	 *           deleted: [];
	 *           dirtied: [];
	 *         };
	 *       }
	 *
	 *       where:
	 *         itemized: true | false,  // true if created,updated, and deleted information is provided
	 *         created:[ c-record ],    // right now only contains a single key property
	 *         updated:[ ids ],         // list of IDs that have been updated
	 *         deleted:[ ids ]          // list of IDs that have been deleted
	 *         dirtied:[ ids ]          // list of IDs that have been updated
	 *
	 * To register a bulk data change listener the following should be done:
	 *   adf.mf.api.addBatchDataChangeListener(variables, providers);
	 *
	 * Then we you will received data change events as follows:
	 *   fa(["#{a}", "{#!a}", "#{a + b}"],
	 *      {myCollectionModel:{itemized:true, created:[0: {key: UID-3464; }], updated:[], deleted:[], dirtied:[]})
	 *
	 */
	var dataChangeListeners                    = {};

	/**
	 * INTERNAL: the array of global batch data change listeners
	 */
	adf.mf.internal.batchDataChangeListeners   = [];

	/**
	 * INTERNAL: the array of pending requests
	 */
	adf.mf.internal.batchRequest               = undefined;

	/**
	 * INTERNAL: storage for batching missing get local values.
	 *
	 * 	@see adf.mf.api.startGetValueBatchRequest
	 *  @see adf.mf.api.flushGetValueBatchRequest
	 */
	adf.mf.internal.el.getValueBatch           = undefined;

	/**
	 * INTERNAL FUNCTION used to log all errors coming back from the JVM.
	 */
	adf.mf.internal.logError = function(req, resp)
	{
		var msg = adf.mf.resource.getInfoString("ADFInfoBundle","MSG_ERROR_IN_REQUEST",
				                                adf.mf.util.stringify(req), adf.mf.util.stringify(resp));

		adf.mf.internal.perf.snapshot("adf.mf.internal.logError", msg);
		adf.mf.log.Framework.logp(adf.mf.log.level.SEVERE, "adf.mf.internal", "logError", msg);
	};
	adf.mf.internal.errorHandlers = [adf.mf.internal.logError];

	/**
	 * PUBLIC FUNCTION used to add a new data change listener (callback) for a given el expression (variable)
	 *
	 * e.g.
	 *   adf.mf.api.addDataChangeListeners("#{bindings.apple}",                   appleChangedCallback);
	 *   adf.mf.api.addDataChangeListeners("#{bindgins.apple + bindings.orange}", appleOrOrangeChangedCallback);
	 *
	 * 	 adf.mf.api.addDataChangeListeners("#{!bindings.foo}",                    bindingsFooChangedCallback);
	 *
	 *   where the callback would looks something like this:
	 *   bindingsFooChangedCallback = function(id)
	 *   {
	 *      document.write("DataChangeNotification 1 notification for ID: " + id);
	 *   }
	 *
	 * If the same expression/listener combination is registered several times, duplicates are discarded.
	 *
	 * For more details see @Understanding_DataChangeListeners
	 *
	 * @export
	 */
	adf.mf.api.addDataChangeListeners = function(expression, callback)
	{
		var variables  = adf.mf.internal.el.parser.parse(expression).dependencies();
		var id         = expression;

		adf.mf.internal.perf.start("adf.mf.api.addDataChangeListeners", variables.length);
		if(adf.mf.log.Framework.isLoggable(adf.mf.log.level.FINEST))
		{
			adf.mf.log.Framework.logp(adf.mf.log.level.FINEST, "adf.mf.api", "addDataChangeListeners",
					               ("addDataChangeListeners " + expression + " ==> " + variables.length + " ==> " + variables.join()));
		}

		for(var v = 0; v < variables.length; ++v)
		{
			var alreadyRegistered = false;
			var variable          = variables[v];
			var dcl               = (variable.slice(0, "bindings".length) == "bindings")?
					                 currentBindingInstance.dataChangeListeners : dataChangeListeners;

			if(dcl[variable] === undefined)
			{   /* if currently we don't have a DCL record for this variable, create it */
				dcl[variable] = {"id":[], "callback":[]};
			};

			/* add the expression id to the dataChangeListeners */
			alreadyRegistered = false;
			for(var i = 0; i < dcl[variable]["id"].length; ++i)
			{
				if(dcl[variable]["id"][i] == id)
				{
					if(adf.mf.log.Framework.isLoggable(adf.mf.log.level.FINER))
					{
						adf.mf.log.Framework.logp(adf.mf.log.level.FINER, "adf.mf.api", "addDataChangeListeners",
								               ("addDataChangeListener " + variable + " id=" + id + " was already registered."));
					}
					alreadyRegistered = true;
					break;  /* you only need to find one match */
				}
			}
			if(!alreadyRegistered)
			{
				dcl[variable]["id"].push(id);

				if(adf.mf.log.Framework.isLoggable(adf.mf.log.level.FINE))
				{
					adf.mf.log.Framework.logp(adf.mf.log.level.FINE, "adf.mf.api", "addDataChangeListeners",
							               ("there are now " + dcl[variable]["id"].length + " different listener's IDs."));
				}
			}

			alreadyRegistered = false;
			for(var i = 0; i < dcl[variable]["callback"].length; ++i)
			{
				if(dcl[variable]["callback"][i].toString() == callback.toString())
				{
					if(adf.mf.log.Framework.isLoggable(adf.mf.log.level.FINE))
					{
						adf.mf.log.Framework.logp(adf.mf.log.level.FINE, "adf.mf.api", "addDataChangeListeners",
								               ("variable " + variable + " already has this callback registered."));
					}

					alreadyRegistered = true;
					break;  /* you only need to find one match */
				}
			}
			if(!alreadyRegistered)
			{
				dcl[variable]["callback"].push(callback);

				if(adf.mf.log.Framework.isLoggable(adf.mf.log.level.FINE))
				{
					adf.mf.log.Framework.logp(adf.mf.log.level.FINE, "adf.mf.api", "addDataChangeListeners",
							               ("there are now " + dcl[variable]["callback"].length + " different callbacks registered."));
				}
			}

			if(adf.mf.log.Framework.isLoggable(adf.mf.log.level.FINEST))
			{
				adf.mf.log.Framework.logp(adf.mf.log.level.FINEST, "adf.mf.api", "addDataChangeListeners",
						               ("adding the " + variable + " " +  adf.mf.util.stringify(dcl[variable]) + " listener."));
			}
			adf.mf.internal.perf.stop("adf.mf.api.addDataChangeListeners", variables.length);
		}
	};

	/**
	 * PUBLIC FUNCTION used to add a new bulk data change listener (callback)
	 *
	 * e.g.
	 *   adf.mf.api.addBatchDataChangeListener(printBatchDataChangeEvent);
	 *
	 *   where the callback would looks something like this:
	 *
	 *   printBatchDataChangeEvent = function(variables, providers) {
	 *     if(variables != undefined) {
	 *       document.write("Batch DCE -- <br> variables = " + adf.mf.util.stringify(variables)+ "<br>");
	 *     }
	 *     if(providers!= undefined) {
	 *       document.write(" providers =" + adf.mf.util.stringify(providers) + "<br>");
	 *     }
	 *   };
	 *
	 * If the same listener is registered several times, duplicates are discarded.
	 *
	 * NOTE: if the providers detail will only contain itemized changes provided the 'itemized'
	 *       property exists and is true.  Otherwise the entire collection model should be updated
	 *       since no detailed information is known.
	 *
	 * For more details see @Understanding_DataChangeListeners
	 *
	 * @export
	 */
	adf.mf.api.addBatchDataChangeListener = function(callback)
	{
		for(var i = 0; i < adf.mf.internal.batchDataChangeListeners.length; ++i)
		{
			if(adf.mf.internal.batchDataChangeListeners[i] == callback) return
		}
		adf.mf.internal.batchDataChangeListeners.push(callback);
	};

	/**
	 * PUBLIC FUNCTION used to add a new error handler (callback)
	 *
	 * e.g.
	 *   adf.mf.api.addErrorHandler(myErrorHandler);
	 *
	 *   where the callback would looks something like this:
	 *   myErrorHandler = function(adfexception)
	 *   {
	 *      document.write("Error Handler 1 notification for: " + adfexception);
	 *   }
	 *
	 * If the same handler is registered several times, duplicates are discarded.
	 *
	 * For more details see @Understanding_ErrorHandlers
	 *
	 * @export
	 */
	adf.mf.api.addErrorHandler = function(callback)
	{
		for(var i = 0; i < adf.mf.internal.errorHandlers.length; ++i)
		{
			if(adf.mf.internal.errorHandlers[i] == callback) return
		}
		adf.mf.internal.errorHandlers.push(callback);
	};


	/**
	 * PUBLIC FUNCTION used to get the current context ID.
	 *
	 * e.g. adf.mf.api.getContextId(successCallback, failedCallback);
	 *
	 * @deprecated
	 * @export
	 */
	/* void */
	adf.mf.api.getContextId = function(success, failed) {
		adf.mf.api.invokeMethod("oracle.adfmf.framework.api.Model", "getContextId", success, failed);
	};


	/**
	 * PUBLIC FUNCTION used to get the current context's pagedef.
	 *
	 * e.g. adf.mf.api.getContextId(success, failed);
	 *
	 * @export
	 */
	/* void */
	adf.mf.api.getContextPageDef = function(success, failed)
	{
		adf.mf.api.invokeMethod("oracle.adfmf.framework.api.Model", "getContextPageDef", success, failed);
	};


	/**
	 * PUBLIC FINCTION used to get the current context's instance ID
	 *
	 * @export
	 */
	/* void */
	adf.mf.api.getContextInstanceId = function(success, failed)
	{
		adf.mf.api.invokeMethod("oracle.adfmf.framework.api.Model", "getContextInstanceId", success, failed);
	};



	/**
	 * PUBLIC FUNCTION used to invoke method in any class in classpath.
	 *
	 * e.g. adf.mf.api.invokeMethod(classname, methodname, param1, param2, ... , paramN ,successCallback, failedCallback);
	 *
	 * @param {string}                               classname  - name of the class
	 * @param {string}                               methodname - name of the method
	 * @param {Array.<string>}                       params     - parameters
	 * @param {Array.<function(Object,Object):void>} success    - invoked when the method is successful invoked
	 *                                                            (signature: success(request, response))
	 * @param {Array.<function(Object,Object):void>} failed     - invoked when an error is encountered
	 *                                                            (signature: failed(request, response))
	 *
	 * Examples:
	 *      adf.mf.api.invokeMethod("TestBean", "setStringProp", "foo", success, failed);
	 *      adf.mf.api.invokeMethod("TestBean", "getStringProp", success, failed);
	 *      adf.mf.api.invokeMethod("TestBean", "testSimpleIntMethod", "101", success, failed); // Integer parameter
	 *      adf.mf.api.invokeMethod("TestBean", "testComplexMethod",
	 *              {"foo":"newfoo","baz":"newbaz",".type":"TestBeanComplexSubType"}, success, failed); // Comples parameter
	 *      adf.mf.api.invokeMethod("TestBean", "getComplexColl", success, failed); // No parameter
	 *      adf.mf.api.invokeMethod("TestBean", "testMethodStringStringString", "Hello ", "World", success, failed); // 2 string parameter
	 */
	adf.mf.api.invokeMethod = function()
	{
        var args = [].splice.call(arguments,0);   // convert arguments into a real array
        
    	var updatedArgs = [null];  // adding the default communication id
        
    	adf.mf.internal.api.invokeMethod.apply(this, updatedArgs.concat(args));  
    };

	/**
	 * PUBLIC FUNCTION used to invoke Security Methods
	 */
    adf.mf.api.invokeSecurityMethod = function(command, username, password, tenantname, success, failed)
    {
    	adf.mf.internal.context.invokeSecurityMethod(command, username, password, tenantname, success, failed);
    };

	/**
	 * PUBLIC FUNCTION used to remove all data change listeners associated with the variable
	 *
	 * For more details see @Understanding_DataChangeListeners
	 */
	adf.mf.api.removeDataChangeListeners = function(expression)
	{
		var variables  = adf.mf.internal.el.parser.parse(expression).dependencies();
		var id         = expression;

		for(var i = 0; i < variables.length; ++i)
		{
			var v   = variables[i];
			var dcl = ((v.slice(0, "bindings".length) == "bindings")?
	                   currentBindingInstance.dataChangeListeners : dataChangeListeners);

			try
			{
				var ida = dcl[v]["id"];
				for(var j = 0; j < ida.length; ++j)
				{
					if(ida[j] === id)
					{
						if(adf.mf.log.Framework.isLoggable(adf.mf.log.level.FINE))
						{
							adf.mf.log.Framework.logp(adf.mf.log.level.FINE, "adf", "removeDataChangeListeners",
									               ("removing the " + adf.mf.util.stringify(ida[j]) + " listener."));
						}
						ida.splice(j,1);
					}
				}
				if(ida.length == 0)
				{	/* clean up the dataChangeListener all together */
					if(adf.mf.log.Framework.isLoggable(adf.mf.log.level.FINE))
					{
						adf.mf.log.Framework.logp(adf.mf.log.level.FINE, "adf", "removeDataChangeListeners",
								               ("removing the " + ida + " listener all together."));
					}
					delete dcl[v];
				}
				if(adf.mf.log.Framework.isLoggable(adf.mf.log.level.FINEST))
				{
					adf.mf.log.Framework.logp(adf.mf.log.level.FINEST, "adf", "removeDataChangeListeners",
							               ("All the current data change listeners in the system:<br> " +
							            		   adf.mf.util.stringify(dcl)));
				}
			}
			catch(e)
			{
				if(adf.mf.log.Framework.isLoggable(adf.mf.log.level.WARNING))
				{
                    adf.mf.log.logInfoResource("ADFInfoBundle", adf.mf.log.level.WARNING, "adf.removeDataChangeListeners", "MSG_EXCEPTION", e);
				}
			}
		}
	};


	/**
	 * PUBLIC FUNCTION used to remove a bulk data change listener
	 *
	 * For more details see @Understanding_DataChangeListeners
	 */
	adf.mf.api.removeBatchDataChangeListener = function(callback)
	{
		var temp = [];

		for(var i = 0; i < adf.mf.internal.batchDataChangeListeners.length; ++i)
		{
			if(adf.mf.internal.batchDataChangeListeners[i] != callback)
			{
				temp.push(adf.mf.internal.batchDataChangeListeners[i]);
			}
		}
		adf.mf.internal.batchDataChangeListeners = temp;
	};


	/**
	 * PUBLIC FUNCTION used to remove an error handler
	 *
	 * For more details see @Understanding_ErrorHandlers
	 */
	adf.mf.api.removeErrorHandler = function(callback)
	{
		var temp = [];

		for(var i = 0; i < adf.mf.internal.errorHandlers.length; ++i)
		{
			if(adf.mf.internal.errorHandlers[i] != callback)
			{
				temp.push(adf.mf.internal.errorHandlers[i]);
			}
		}
		adf.mf.internal.errorHandlers = temp;
	};


	/**
	 * PUBLIC FUNCTION used to reset context. Call this before setting new context.
	 * This is exactly the same as calling adf.mf.api.setContext with an empty context name.
	 *
	 * e.g. adf.mf.api.removeContextInstance(successCallback, failedCallback);
	 */
	adf.mf.api.removeContextInstance = function(pageDef, instanceId, success, failed)
	{
		adf.mf.internal.el.resetBindingContext();
		adf.mf.api.invokeMethod("oracle.adfmf.framework.api.Model",
				                "removeContextInstance", pageDef, instanceId, success, failed);
	};


	/**
	 * PUBLIC FUNCTION used to reset context. Call this before setting new context.
	 * This is exactly the same as calling adf.mf.api.setContext with an empty context name.
	 *
	 * e.g. adf.mf.api.resetContext(successCallback, failedCallback);
	 *
	 * @deprecated
	 */
	/* void */
	adf.mf.api.resetContext = function(success, failed)
	{
		adf.mf.api.setContext("", success, failed);
	};



	/**
	 * PUBLIC FUNCTION used to set context for the specified name
	 *
	 * e.g. adf.mf.api.setContext("MyPage", "MyPage-1", true, true, successCallback, failedCallback);
	 *
	 * pageDef    - name of the page definition
	 * instanceId - unique id for the instance
	 * resetState - reset the bindings associated with this instance
	 * reSync     - re-send the initial bindings structure to the container
	 */
	adf.mf.api.setContextInstance = function(pageDef, instanceId, resetState, /* boolean */reSync, success, failed)
	{
		try
		{
			if((pageDef === undefined) || (pageDef === null) || (pageDef.length < 1))
			{   /* clear all the bindings and listeners associated with this context */
				if(adf.mf.log.Framework.isLoggable(adf.mf.log.level.FINER))
				{
					adf.mf.log.Framework.logp(adf.mf.log.level.FINER, "adf", "setContextInstance",
							               ("\n\n*******\nBindings = " + adf.mf.util.stringify(adf.mf.api.getLocalValue("#{bindings}")) + "\n*******\n\n"));
				}
				adf.mf.api.removeContextInstance(pageDef, instanceId);
			}
			else
			{
				adf.mf.internal.el.switchBindingInstance(pageDef + ":" + instanceId);

				adf.mf.api.invokeMethod("oracle.adfmf.framework.api.Model", "setContextInstance",
						                pageDef, instanceId, resetState, reSync, success, failed);
			}
		}
		catch(ge)
		{
			if(adf.mf.log.Framework.isLoggable(adf.mf.log.level.WARNING))
			{
                adf.mf.log.logInfoResource("ADFInfoBundle", adf.mf.log.level.WARNING, "adf.setContextInstance", "MSG_EXCEPTION", ge);
			}
		}
	};


	/**
	 * PUBLIC FUNCTION used to clear and then set context for the specified name
	 *
	 * @param name    - name of the context
	 * @param success - call on success
	 * @param failed  - call on failed
	 *
	 * this is the same as calling adf.mf.internal.api.setContext(name, true, success, failed);
	 *
	 * e.g. adf.mf.api.setContext("myContextName", successCallback, failedCallback);
	 *
	 * @deprecated
	 */
	/* void */
	adf.mf.api.clearAndSetContext = function(/* context name */ name, success, failed)
	{
		adf.mf.internal.api.setContext(name, true, success, failed);
	};

	/**
	 * PUBLIC FUNCTION used to set context for the specified name
	 *
	 * @param name    - name of the context
	 * @param success - call on success
	 * @param failed  - call on failed
	 *
	 * this is the same as calling adf.mf.internal.api.setContext(name, false, success, failed);
	 *
	 * e.g. adf.mf.api.setContext("myContextName", successCallback, failedCallback);
	 *
	 * @deprecated
	 */
	/* void */
	adf.mf.api.setContext = function(/* context name */ name, success, failed)
	{
		adf.mf.internal.api.setContext(name, false, success, failed);
	};

	/**
	 * INTERNAL FUNCTION used to set context for the specified name
	 *
	 * @param name       - name of the context
	 * @param clearPrior - true for clear the current context
	 * @param success    - call on success
	 * @param failed     - call on failed
	 *
	 * e.g. adf.mf.api.setContext("myContextName", true, successCallback, failedCallback);
	 *
	 * @deprecated
	 */
	/* void */
	adf.mf.internal.api.setContext = function(/* String */ name, /* boolean */clearPrior, success, failed)
	{
		try
		{
			var scb   = [];
			var fcb   = [];

            scb = scb.concat([function() {adf.mf.internal.perf.stop("adf.mf.api.setContext", name);}]);
            scb = scb.concat(adf.mf.internal.util.is_array(success)? success : [success]);

			fcb = fcb.concat([function() {adf.mf.internal.perf.stop("adf.mf.api.setContext", name);}]);
			fcb = fcb.concat(adf.mf.internal.util.is_array(failed)?  failed  : [failed ]);

			if((name === undefined) || (name === null) || (name.length < 1))
			{   /* clear all the bindings and listeners associated with this context */
				if(adf.mf.log.Framework.isLoggable(adf.mf.log.level.FINER))
				{
					adf.mf.log.Framework.logp(adf.mf.log.level.FINER, "adf", "setContext",
							               ("\n\n*******\nBindings = " + adf.mf.util.stringify(adf.mf.api.getLocalValue("#{bindings}")) + "\n*******\n\n"));
				}
				adf.mf.internal.el.resetBindingContext();
			}

			adf.mf.internal.perf.start("adf.mf.api.setContext", name);
			adf.mf.api.invokeMethod("oracle.adfmf.framework.api.Model", "setContext", name,	scb, fcb);
		}
		catch(ge)
		{
			adf.mf.internal.perf.stop("adf.mf.api.setContext", (name + " - error: " + ge));

			if(adf.mf.log.Framework.isLoggable(adf.mf.log.level.WARNING))
			{
                adf.mf.log.logInfoResource("ADFInfoBundle", adf.mf.log.level.WARNING, "adf.setContext", "MSG_EXCEPTION", ge);
			}
		}
	};


	/**
	 * PUBLIC FUNCTION used to create a top-level variable
	 * into the context.  This should be thought of as adding
	 * a variable to the root namespace for variables.
	 *
	 * i.e. adf.mf.api.addVariable("name", some_object);
	 *
	 * addVariable/removeVariable are used to add and then remove
	 * temporary variables, like loop iterator variables along with
	 * longer lasting variables.
	 */
	/* void */
	adf.mf.el.addVariable = function(/* variable name */ name, /* new value */ value)
	{
		adf.mf.internal.perf.snapshot("adf.mf.api.addVariable", name);
		adf.mf.internal.context.setVariable(name, value);
	};
	adf.mf.api.addVariable = adf.mf.el.addVariable;


	/**
	 * PUBLIC FUNCTION will evaluate the passed in expression against
	 * the local cache ONLY.  If there are terms that are currently
	 * not cached or any function calls then undefined will be returned.
	 * If the adf.mf.api.startGetValueBatchRequest has been called any
	 * EL expression cache misses will be queued to fetched on the
	 * adf.mf.api.flushGetValueBatchRequest call.
	 *
	 * @see adf.mf.api.addVariable
	 * @see adf.mf.api.removeVariable
	 *
	 * @see adf.mf.api.getValue
	 * @see adf.mf.api.setValue
	 * @see adf.mf.api.setLocalValue
	 *
	 * @see adf.mf.api.startGetValueBatchRequest
	 * @see adf.mf.api.flushGetValueBatchRequest
	 */
	adf.mf.el.getLocalValue = function(/* expression */ expression)
	{
		var val = undefined;

		try
		{
			adf.mf.internal.perf.snapshot("adf.mf.api.getLocalValue", expression);

			val = adf.mf.internal.el.parser.evaluate(adf.mf.internal.context, expression);
		}
		catch(e1)
		{   /* expression was not found */
			if(adf.mf.log.Framework.isLoggable(adf.mf.log.level.FINER))
			{
				adf.mf.log.Framework.logp(adf.mf.log.level.FINE, "adf.mf.api", "getLocalValue",
                            ("unable to resolve '" + expression + "' locally."));
			}

			/*
			 * NOTE: only if the internal batch is defined will we batch the
			 * expression to fetch when adf.mf.api.flushGetValueBatchRequest.
			 */
			if(adf.mf.internal.el.getValueBatch !== undefined)
			{
				try
				{
	    			var exp   = adf.mf.internal.el.parser.parse(expression).toContextFreeExpression();
	    			var terms = adf.mf.internal.el.parser.parse(exp).dependencies();

	    			for(var t = 0; t < terms.length; ++t) {
	    				var term = "#{"+terms[t]+"}";
	    				try
	    				{
	    					val = adf.mf.internal.el.parser.evaluate(adf.mf.internal.context, term);
                if (val === undefined) 
                {
                  // adf.mf.internal.el.getValueBatch.push(term);
                  if(adf.mf.log.Framework.isLoggable(adf.mf.log.level.FINER))
                  {
                    adf.mf.log.Framework.logp(adf.mf.log.level.FINER, "adf.mf.api", "getLocalValue",
                                              "we currently do not have term: " + term + " cached, adding to the batch.");
	    				}
                }
	    				}
	    				catch(e3)
	    				{
	        				adf.mf.internal.el.getValueBatch.push(term);

	    					if(adf.mf.log.Framework.isLoggable(adf.mf.log.level.FINER))
	    					{
	    						adf.mf.log.Framework.logp(adf.mf.log.level.FINER, "adf.mf.api", "getLocalValue",
	                                    "we currently do not have term: " + term + " cached, adding to the batch.");
	    					}
	    				}
	    			}
				}
				catch(e2)
				{
                    /* the only way you would get here is if the EL Expression can not be parsed. */

		            /*
		             * Look to see if there is any registered error handlers and call them.
		             */
					adf.mf.internal.api.notifyErrorHandlers(expression, e2);


		            /*
		             * Since the bulk of the callers do not handle exceptions well we are going
		             * to simply return the exception as the value.  This is similar to what we
		             * do in getValues so there is no difference here.  The UI should look at
		             * the value and handle it correctly.
		             */
		            val = e2;
				}
			}
		}
		finally
		{
			// no-value adf.mf.internal.perf.stop("adf.mf.api.getLocalValue", expression);
		}
		return val;
	};
	adf.mf.api.getLocalValue = adf.mf.el.getLocalValue;


	/**
	 * startGetValueBatchRequest is responsible for starting a new get value
	 * batch so theproper "behind the scene" call to get the values can be
	 * called at the flushGetValueBatchRequest call.
	 *
	 * @see adf.mf.api.startGetValueBatchRequest
	 */
	/* void */
	adf.mf.el.startGetValueBatchRequest = function()
	{
		if(adf.mf.internal.el.getValueBatch !== undefined)
		{
			throw new adf.mf.ELException("GetValueBatchRequest already started");
		}
		else
		{
 			adf.mf.internal.el.getValueBatch = [];
		}
	};
	adf.mf.api.startGetValueBatchRequest = adf.mf.el.startGetValueBatchRequest;

	/**
	 * @returns the list of all terms used in any of the ELs
	 */
	/* String[] */
	adf.mf.internal.el.getListOfTerms = function(/* array */ els)
	{
		var variables = els || [];
		var terms     = [];
		var length    = 0;

		variables = adf.mf.internal.util.is_array(variables)? variables : [variables];
		length    = variables.length;

		for(var i = 0; i < length; ++i)
		{
			var ele   = adf.mf.internal.el.parser.parse(variables[i]);

			if((ele !== undefined) || (ele !== null)) {
				terms  = terms.concat(ele.dependencies());
			}
		}
		return terms;
	};


    /**
     * flushGetValueBatchRequest is responsible for closing off the current
     * batch and make the proper "behind the scene" call to get the values.
     *
     * @see adf.mf.api.startGetValueBatchRequest
     */
    /* void */
    adf.mf.el.flushGetValueBatchRequest = function()
    {
        if (adf.mf.internal.el.getValueBatch !== undefined)
        {
            if(adf.mf.internal.el.getValueBatch.length > 0)
            {
               adf.mf.internal.perf.start("adf.mf.api.flushGetValueBatchRequest", (adf.mf.internal.el.getValueBatch.length + " entries"));

               adf.mf.api.getValue(adf.mf.util.removeDuplicates(adf.mf.internal.el.getValueBatch),
                function(a,b)
                {
                    try
                    {
                        var terms = adf.mf.internal.el.getListOfTerms(a.params[0]);

                        adf.mf.internal.api.notifyDataChangeListeners(terms);
                        adf.mf.internal.perf.stop("adf.mf.api.flushGetValueBatchRequest", adf.mf.internal.util.stringify(terms));
                    }
                    catch(e)
                    {
                        adf.mf.internal.perf.stop("adf.mf.api.flushGetValueBatchRequest - Error: " +
                                                   adf.mf.internal.util.stringify(e));
                    }
                },
                function(a, b)
                {
                    adf.mf.internal.perf.stop("adf.mf.api.flushGetValueBatchRequest");
                });
            }

            adf.mf.internal.el.getValueBatch = undefined;
        }
        else
        {
            throw new adf.mf.IllegalStateException("No get value batch started.");
        }
    };
    adf.mf.api.flushGetValueBatchRequest = adf.mf.el.flushGetValueBatchRequest;



	/**
	 * PUBLIC FUNCTION used to evaluate the expression(s) passed in and return the associated
	 * value(s) via the success callback.  Since not all variables may not be resolved only the
	 * resolved expressions will be returned in the 'response' property of the success callback.
	 *
	 * Given that you can use this method to get the value for:
	 *
	 * Evaluation of a single EL expression:
	 * e.g. adf.mf.api.getValue("#{100+2*20/3}", success, failed);
	 * e.g. adf.mf.api.getValue("#{bindings.userName.inputValue}", success, failed);
	 *
	 * Evaluation of an array of EL expressions:
	 * e.g. adf.mf.api.getValue(["#{100+2*20/3}", "#{500/2}"], success, failed);
	 * e.g. adf.mf.api.getValue(["#{bindings.foo}", "#{applicationScope.username}"], success, failed);
	 *
	 * Success Callback:
	 * success(request, response)
	 *   where the request echos the first argument passed in
	 *     and the response is an array of name-value-pairs, one for each resolved expression.
	 * so if we take our examples above:
	 *   e.g. adf.mf.api.getValue("#{100+2*20/3}", success, failed);
	 *        success(["#{100+2*20/3}"], [ {name:"#{100+2*20/3}", value:"113.33"} ] )
	 *
	 *   e.g. adf.mf.api.getValue("#{bindings.userName.inputValue}", success, failed);
	 *        success(["#{bindings.userName.inputValue}"], [ {name:"#{bindings.userName.inputValue}", value:"me"} ] )
	 *
	 *   e.g. adf.mf.api.getValue(["#{100+2*20/3}", "#{500/2}"], success, failed);
	 *        success(["#{100+2*20/3}", "#{500/2}"],
	 *                [ {name:"#{100+2*20/3}", value:"113.33"}, {name:"#{500/2}", value:"250"} ] )
	 *
	 * Now let suppose that bindings.foo exists but not bindings.bar.  In this case would see:
	 * e.g. adf.mf.api.getValue( ["#{bindings.foo}", "#{bindings.bar}"], success, failed);
	 *        success(["#{bindings.foo}", "#{bindings.bar}"],
	 *                [{ "name": "#{bindings.foo}", "value": "foo" }] )
	 *          *** notice: binding.bar was not part of the result array
	 *
	 * Failed Callback:
	 * failed(request, exception)
	 *   where the request echos the first argument passed in
	 *     and the exception encountered resulting in all of the expressions failing to be resolved
	 *
	 * There also exists another way to invoke the getValue used to resolve a property from an already
	 * retrieved base object.  This version is used by the AMX layer to do things like iterator variables
	 * when doing collection/lists/tables.  In this version, we simply let the EL resolvers determine
	 * the "right thing to do" based on the 'base' and 'property' variables:
	 *
	 * e.g. adf.mf.api.getValue(base, property);
	 *   where the value returned is value of the property or nil if it does not exists.
	 **/
	adf.mf.el.getValue = function()
	{
		var argv  = arguments;
		var argc  = arguments.length;

		if (argc!=4 && argc!=3 && argc!=2)
		{
			throw new adf.mf.ELException("Wrong number of arguments");
		}

		try
		{
			if (typeof(argv[1])!='object' && (argv[1] instanceof Function))
			{
				/*
				 * Note: in order to make [gs]etValue individual errors show up in the error view
				 *       we will inject a nvpSimulatedErrors callback into the success callback vector.
				 *       We only need to include it in the success because the failed will automatically
				 *       be routed to the error handlers (see JavaScriptContext.nonBlockingCall)
				 */
				var expression     = (adf.mf.internal.util.is_array(argv[0]))? argv[0] : [argv[0]];
				var success        = (adf.mf.internal.util.is_array(argv[1]))? argv[1] : [argv[1]];
				var failed         = (adf.mf.internal.util.is_array(argv[2]))? argv[2] : [argv[2]];
				var errorHandler   = ((argc == 4) && (argv[3] == true))?
                                                  adf.mf.internal.api.nvpEatErrors :
                                                  adf.mf.internal.api.nvpSimulatedErrors;
				var scb            = [errorHandler,
                                      function() {adf.mf.internal.perf.stop("adf.mf.api.getValue", "success");}];
				var fcb            = [function() {adf.mf.internal.perf.stop("adf.mf.api.getValue", "failed");}];

		        adf.mf.internal.perf.start("adf.mf.api.getValue");

				try
				{
					var count = expression.length;
					var nvpa  = [];

					for (var i = 0; i < count; i++)
					{
            var temp = undefined;
 
                        adf.mf.internal.perf.snapshot("evaluating locally", expression[i]);
 
            if((temp = adf.mf.internal.el.parser.evaluate(adf.mf.internal.context, expression[i])) === undefined)
            {
              throw new adf.mf.PropertyNotFoundException(expression[i]);
					}
            else
            {
              nvpa.push({"name":expression[i], "value":temp});
            }
					}

					if(adf.mf.log.Framework.isLoggable(adf.mf.log.level.FINE))
					{
						adf.mf.log.Framework.logp(adf.mf.log.level.FINE, "adf.mf.api", "getValue",
                        ("adfmf- did not call the server for " + expression.join(", ")));
					}

                    adf.mf.internal.perf.stop("adf.mf.api.getValue", "found everything locally");
					for(var i = 0; i < success.length; ++i)
					{
						try
						{
							success[i](expression, nvpa);
						}
						catch(fe)
						{
                            adf.mf.log.logInfoResource("ADFInfoBundle", adf.mf.log.level.SEVERE,
                            		                   "adf.mf.api.getValue", "MSG_GETVALUE_SUCCESS_CB_ERROR", i, fe);
						}
					}
				}
				catch (e) {
                    var  terms   = expression;
                    var  count   = expression.length;

                    /* then add any additional terms */
                    for(i = 0; i < count; i++)
                    {
                        var ele = adf.mf.internal.el.parser.parse(expression[i]);
                        var dep = ele.dependencies();
                        for(var j = 0; j < dep.length; j++) terms.push("#{" + adf.mf.internal.context.uncompressReference(dep[j]) + "}");
                    }

					if(adf.mf.log.Framework.isLoggable(adf.mf.log.level.FINE))
					{
						adf.mf.log.Framework.logp(adf.mf.log.level.FINE, "adf.mf.api", "getValue",
                        ("adfmf- needs to call the server for " + terms.join(", ")));
					}
					/* inject the addtional callbacks for: caching and peformance */
					scb     = scb.concat(adf.mf.internal.el.cacheResult, success);
					fcb     = fcb.concat(failed);
					adf.mf.api.invokeMethod("oracle.adfmf.framework.api.Model", "getValue", terms, scb, fcb);
				}
			}
			else
			{
				var base     = argv[0];
				var property = argv[1];
				value        = adf.mf.internal.context.getELResolver().getValue(adf.mf.internal.context, base, property);
                adf.mf.internal.perf.snapshot("context.getELResolver().getValue", (base + "." + property));
			}
		}
		catch(ge)
		{
			var expression     = (adf.mf.internal.util.is_array(argv[0]))? argv[0] : [argv[0]];
			var failed         = (adf.mf.internal.util.is_array(argv[2]))? argv[2] : [argv[2]];

            adf.mf.log.logInfoResource("ADFInfoBundle", adf.mf.log.level.SEVERE,
            		                   "adf.mf.api.getValue", "MSG_EXCEPTION_RESOLVING", ge, expression.join(", "));

            adf.mf.internal.perf.stop("adf.mf.api.getLocalValue", ("exception - " + ge));
			for(var i = 0; i < failed.length; ++i)
            {
                try
                {
                    failed[i](expression, ge);
                }
                catch(fe)
                {
                    adf.mf.log.logInfoResource("ADFInfoBundle", adf.mf.log.level.SEVERE,
                    		                   "adf.mf.api.getValue", "MSG_GETVALUE_FAILED_CB_ERROR", i, fe);
                }
            }
		}
		finally
		{
            // adf.mf.internal.perf.stop("adf.mf.api.getLocalValue - finally");
		}
	};
	adf.mf.api.getValue = adf.mf.el.getValue;

	/**
	 * PUBLIC FUNCTION used to used to invoke a method expression in the java environment.
	 *
	 * expression: is the method expression itself
	 *             i.e. #{bean.method}  #{applicationScope.bean.method}
	 * params    : is an array of zero or more values that should be passed as the method parameters
	 *             i.e. []                      - to invoke bean.method()
	 *             or ["Hello"]                 - to invoke bean.method(String)
	 *             or [[false, false], "Hello"] - to invoke bean.method(boolean[], String)
	 * returnType: is the return type
	 *             i.e. void                    -
	 *             i.e. String                  - return type is a string
	 * types     : i.e. []                      - no parameters
	 *             i.e. [java.lang.String]      - one parameter of type String
	 *             i.e. [java.lang.String, int] - parameter-1 of type String, parameter-2 of type int
	 *
	 * Given this information the correct method will be looked up and invoked from the given method.
	 *
	 * Evaluation of a single EL expression:
	 * e.g. invoke("#{Bean.foobar}", [parameters], [parameter-types], success, failed);
	 *
	 * Success Callback:
	 * success(request, response)
	 *   where the request echos the first argument passed in
	 *     and the response is an array of name-value-pairs, one for each resolved expression.
	 * so if we take our examples above:
	 *   e.g. adf.mf.api.invoke("#{Bean.foobar}", [], "java.lang.String", [], success, failed);
	 *        success({method:"#{Bean.foobar}" arguments:[]}, {result:....} )
	 *
	 * Failed Callback:
	 * failed(request, exception)
	 *   where the request echos the first argument passed in
	 *     and the exception encountered resulting in all of the expressions failing to be resolved
	 **/
	adf.mf.el.invoke = function(expression, params, returnType, types, success, failed)
	{
		adf.mf.api.invokeMethod("oracle.adfmf.framework.api.Model", "evaluateMethodExpression",
				                expression, params, returnType, types, success, failed);
	};


	/**
	 * PUBLIC FUNCTION used to update a value for a given variable expression.
	 * Since variable expressions are the only type of expressions that can be LHS
	 * (left-hand-side) expressions we can rule out all literal, complex, and method
	 * expressions from the possible input.
	 *
	 * A simple name-value-pair object is used to denote the variable expression (name)
	 * with it's desired value (value).  An example of this would be:
	 *       { "name":"#{applicationScope.foo}", value:"foobar" }
	 *
	 * Similar to the getValue function, the setValue can take a single name-value-pair
	 * or an array of them for doing batch sets.  The following examples will highlight
	 * these cases:
	 *
	 * Passing only a single name-value-pair
	 * e.g. adf.mf.api.setValue( { "name": "#{bindings.foo}", "value": "foo" }, success, failed);
	 *      resulting in the bindings.foo variable being assigned foo
	 *
	 * Passing an array of name-value-pairs
	 * e.g. adf.mf.api.setValue( [{ "name": "#{bindings.foo}", "value": "foo" },
	 *                        { "name": "#{bindings.bar}", "value": "bar" }], success, failed);
	 *      resulting in the bindings.foo variable being assigned foo and
	 *                       bindings.bar variable being assigned bar
	 *
	 *
	 * Success Callback:
	 * success(request, response)
	 *   where the request echos the first argument passed in
	 *     and the response is an array of name-value-pairs, one for each resolved expression.
	 * so if we take our examples above:
	 *   e.g. adf.mf.api.setValue( { "name": "#{bindings.foo}", "value": "foo" }, success, failed);
	 *        success(["{ "name": "#{bindings.foo}", "value": "foo" }"], [ { "name": "#{bindings.foo}", "value": "foo" } ] )
	 *
	 * e.g. adf.mf.api.setValue( [{ "name": "#{bindings.foo}", "value": "foo" },
	 *                        { "name": "#{bindings.bar}", "value": "bar" }], success, failed);
	 *        success([{ "name": "#{bindings.foo}", "value": "foo" },
	 *                 { "name": "#{bindings.bar}", "value": "bar" }],
	 *                [{ "name": "#{bindings.foo}", "value": "foo" },
	 *                 { "name": "#{bindings.bar}", "value": "bar" }] )
	 *
	 * Now let suppose that bindings.foo exists but not bindings.bar.  In this case would see:
	 * e.g. adf.mf.api.setValue( [{ "name": "#{bindings.foo}", "value": "foo" },
	 *                        { "name": "#{bindings.bar}", "value": "bar" }], success, failed);
	 *        success([{ "name": "#{bindings.foo}", "value": "foo" },
	 *                 { "name": "#{bindings.bar}", "value": "bar" }],
	 *                [{ "name": "#{bindings.foo}", "value": "foo" }] )
	 *          *** notice: binding.bar was not part of the result array
	 *
	 * Failed Callback:
	 * failed(request, exception)
	 *   where the request echos the first argument passed in
	 *     and the exception encountered resulting in all of the expressions failing to be resolved
	 *
	 * There also exists another way to invoke the setValue used to set a property from an already
	 * retrieved base object.  This version is used by the AMX layer to do things like iterator variables
	 * when doing collection/lists/tables.  In this version, we simply let the EL resolvers determine
	 * the "right thing to do" based on the 'base' and 'property' variables:
	 *
	 * e.g. adf.mf.api.setValue(base, property, value);
	 *   where the base.property is assigned the value of 'value'
	 *
	 **/
	adf.mf.el.setValue = function()
	{
		var argv  = arguments;
		var argc  = arguments.length;

		if (argc != 3)
		{
			throw new adf.mf.ELException("Wrong number of arguments");
		}

		try
		{
			/*
			 * Note: in order to make [gs]etValue individual errors show up in the error view
			 *       we will inject a nvpSimulatedErrors callback into the success callback vector.
			 *       We only need to include it in the success because the failed will automatically
			 *       be routed to the error handlers (see JavaScriptContext.nonBlockingCall)
			 */
			var nvp     = (adf.mf.internal.util.is_array(argv[0]))? argv[0] : [argv[0]];
			var success = (adf.mf.internal.util.is_array(argv[1]))? argv[1] : [argv[1]];
			var failed  = (adf.mf.internal.util.is_array(argv[2]))? argv[2] : [argv[2]];
			var scb     = [];
			var fcb     = [];

			adf.mf.internal.perf.start("adf.mf.api.setValue", "for " + nvp.length);

			var len  = nvp.length;
			for(var i = 0; i < len; ++i) {
                var ele = adf.mf.internal.el.parser.parse(nvp[i].name);
                var dep = ele.dependencies();
                for(var j = 0; j < dep.length; j++) nvp[i].name = "#{" + adf.mf.internal.context.uncompressReference(dep[j]) + "}";
			}
            adf.mf.internal.perf.snapshot("adf.mf.api.setValue", "We now have the uncompressed terms.");


			if (success[0] instanceof Function)
			{
				if(adf.mf.internal.isJavaAvailable())
				{  /* since java is available we need to also do the remote write */
					var rscb = [];

					rscb = rscb.concat([adf.mf.internal.api.nvpSimulatedErrors]);
					rscb = rscb.concat([function() {adf.mf.internal.perf.stop("adf.mf.api.setValue", "success");}]);
					rscb = rscb.concat(success);

					scb = scb.concat(function() { adf.mf.api.invokeMethod("oracle.adfmf.framework.api.Model", "setValue", nvp, rscb, failed); });
					fcb = scb.concat(failed);
				}
				else
				{  /* since java is _NOT_ available store the value locally and notify the data change listeners (ndcl) */
					var  ndcl = undefined;

					ndcl = [function() { for(var v = 0; v < nvp.length; ++v) {
                                             var terms = adf.mf.internal.el.parser.parse(nvp[v].name).dependencies();
                                             adf.mf.internal.api.notifyDataChangeListeners(terms); }
                                        }];

					scb = ndcl.concat(function() {adf.mf.internal.perf.stop("adf.mf.api.setValue", "success");});
					scb = scb.concat(success);

					fcb = ndcl.concat(function() {adf.mf.internal.perf.stop("adf.mf.api.setValue", "failed");});
					fcb = fcb.concat(failed);
                    adf.mf.log.logInfoResource("ADFInfoBundle", adf.mf.log.level.WARNING, "adf.mf.api.setValue", "MSG_SKIP_REMOTE_WRITE");
				}

	            adf.mf.internal.perf.snapshot("adf.mf.api.setValue", "now calling setLocalValue");

				adf.mf.api.setLocalValue(nvp, scb, fcb);
			}
			else
			{
				var base     = argv[0];
				var property = argv[1];
				var value    = argv[2];

				adf.mf.internal.context.getELResolver().setValue(adf.mf.internal.context, base, property, value);
                adf.mf.internal.perf.stop("adf.mf.api.setValue", (base + "." + property));
			}
		}
		catch(ge)
		{
            adf.mf.internal.perf.stop("adf.mf.api.setValue", ("exception " + ge));
            adf.mf.log.logInfoResource("ADFInfoBundle", adf.mf.log.level.SEVERE,
            		                   "adf.mf.api.setValue", "MSG_EXCEPTION", ge);
		}
		finally
		{
			// nothing more that needs to be done here.
		}
	};
	adf.mf.api.setValue = adf.mf.el.setValue;


	/**
	 * PUBLIC FUNCTION used to set the value only on the javascript side.
	 *
	 * @see adf.mf.api.setValue
	 */
	adf.mf.el.setLocalValue = function()
	{
        // no-value adf.mf.internal.perf.start("adf.mf.api.setLocalValue");

		try
		{
			if (arguments.length != 3)
			{
				throw new adf.mf.ELException("Wrong number of arguments");
			}

			var argv    = arguments;
			var nvp     = (adf.mf.internal.util.is_array(argv[0]))? argv[0] : [argv[0]];
			var success = (adf.mf.internal.util.is_array(argv[1]))? argv[1] : [argv[1]];
			var failed  = (adf.mf.internal.util.is_array(argv[2]))? argv[2] : [argv[2]];

			if (success[0] instanceof Function)
			{
				try
				{
					var count = nvp.length;
					for (var i = 0; i < count; i++)
					{
						var  n = nvp[i].name;
						var  v = (nvp[i] === undefined)? null : nvp[i].value;

						if((v != null) && (v[adf.mf.internal.api.constants.VALUE_REF_PROPERTY] !== undefined))
						{
					        adf.mf.internal.perf.snapshot("adf.mf.api.setLocalValue", ("value reference property ignored - " + n));

							if(adf.mf.log.Framework.isLoggable(adf.mf.log.level.FINE))
							{
								adf.mf.log.Framework.logp(adf.mf.log.level.FINE, "adf.mf.api", "setLocalValue",
										               ("adfmf- not caching '" + n + "' because it is value reference."));
							}
						}
						else
						if((v != null) && (v[adf.mf.internal.api.constants.TRANSIENT_FLAG_PROPERTY] !== undefined))
						{
					        adf.mf.internal.perf.snapshot("adf.mf.api.setLocalValue", ("transient property ignored - " + n));

							if(adf.mf.log.Framework.isLoggable(adf.mf.log.level.FINE))
							{
								adf.mf.log.Framework.logp(adf.mf.log.level.FINE, "adf.mf.api", "setLocalValue",
										               ("adfmf- not caching '" + n + "' because it is transient."));
							}
						}
						else
						{
							var ve = factory.createValueExpression(adf.mf.internal.context, n, 'object');
							ve.setValue(adf.mf.internal.context, v);

					        adf.mf.internal.perf.snapshot("adf.mf.api.setLocalValue", n);

							if(adf.mf.log.Framework.isLoggable(adf.mf.log.level.FINE))
							{
								adf.mf.log.Framework.logp(adf.mf.log.level.FINE, "adf.mf.api", "setLocalValue",
								                       ("adfmf- setting local value : " + n));
							}
						}
					}
				}
				catch(e1)
				{
					try
					{
                        adf.mf.log.logInfoResource("ADFInfoBundle", adf.mf.log.level.SEVERE,
                        		                   "adf.mf.api.setLocalValue", "MSG_SET_LOCAL_VALUE_FAILED", e1);

						for(var i = 0; i < failed.length; ++i)
						{
							failed[i](nvp, e1);
						}
						if(adf.mf.log.Framework.isLoggable(adf.mf.log.level.FINE))
						{
							adf.mf.log.Framework.logp(adf.mf.log.level.FINE, "adf.mf.api", "setLocalValue",
							                       ("set local value failed callback has been executed."));
						}
					}
					catch(e2)
					{
                        adf.mf.log.logInfoResource("ADFInfoBundle", adf.mf.log.level.SEVERE,
                        		                   "adf.mf.api.setLocalValue", "MSG_SET_LOCAL_VALUE_FAILED_CB", e2);
					}
					return;
				}

				if(adf.mf.log.Framework.isLoggable(adf.mf.log.level.FINE))
				{
					adf.mf.log.Framework.logp(adf.mf.log.level.FINE, "adf.mf.api", "setLocalValue",
					                          "set local value is now complete and now calling the success callback(s)");
				}
				for(var i = 0; i < success.length; ++i)
				{
					try
					{
						success[i](nvp, nvp);
					}
					catch(fe)
					{
                        adf.mf.log.logInfoResource("ADFInfoBundle", adf.mf.log.level.SEVERE,
                        		                   "adf.mf.api.setLocalValue", "MSG_SET_LOCAL_VALUE_SUCCESS_CB_FAILED", i, fe);
					}
				}
				if(adf.mf.log.Framework.isLoggable(adf.mf.log.level.FINE))
				{
					adf.mf.log.Framework.logp(adf.mf.log.level.FINE, "adf.mf.api", "setLocalValue",
					                       ("set local value is now complete and " + success.length + " success callback has been executed."));
				}
			}
			else
			{
				var base     = argv[0];
				var property = argv[1];
				var value    = argv[2];

				adf.mf.internal.context.getELResolver().setValue(adf.mf.internal.context, base, property, value);
                adf.mf.internal.perf.snapshot("context.getELResolver().setValue", (base + "." + property));
			}
		}
		catch(ge)
		{
            adf.mf.log.logInfoResource("ADFInfoBundle", adf.mf.log.level.SEVERE,
            		                   "adf.mf.api.setLocalValue", "MSG_EXCEPTION", ge);
		}
		finally
		{
            // no-value adf.mf.internal.perf.stop("adf.mf.api.setLocalValue");
		}
	};
	adf.mf.api.setLocalValue = adf.mf.el.setLocalValue;


	/**
	 * PUBLIC FUNCTION used to remove a top-level variable
	 * from the context.  This should be thought of as removing
	 * a variable from the root namespace for variables.
	 *
	 * i.e. adf.mf.api.removeVariable("name");
	 */
	/* void */
	adf.mf.el.removeVariable = function(/* variable name */ name)
	{
		adf.mf.internal.perf.snapshot("adf.mf.api.removeVariable", name);
		adf.mf.internal.context.removeVariable(name);
		// no-value adf.mf.internal.perf.stop("adf.mf.api.removeVariable", name);
	};
	adf.mf.api.removeVariable = adf.mf.el.removeVariable;


	/**
	 * PUBLIC FUNCTION used to create a top-level variable
	 * into the context.  This should be thought of as adding
	 * a variable to the root namespace for variables.
	 *
	 * i.e. adf.mf.api.setVariable("name", some_object);
	 *
	 * Most of the time the 'some_object' will be a property
	 * map.  So we can do things like:
	 *   adf.mf.api.getValue("${name.property}");
	 */
	/* void */
	adf.mf.el.setVariable = function(/* variable name */ name, /* new value */ value)
	{
		adf.mf.internal.perf.start("adf.mf.api.setVariable", name);
		adf.mf.internal.context.setVariable(name, value);
		adf.mf.internal.api.notifyDataChangeListeners(name);
		adf.mf.internal.perf.stop("adf.mf.api.setVariable", name);
	};
	adf.mf.api.setVariable = adf.mf.el.setVariable;


    /**
     *  Push a new pageFlowScope instance.  This methods marks the beginning of
     *  the scope's lifespan.
	 */
	 adf.mf.api.pushPageFlowScope = function(success, failed)
	 {
		 adf.mf.api.invokeMethod("oracle.adfmf.framework.api.Model", "pushPageFlowScope", success, failed);
     };


     /**
      * Pop the current pageFlowScope and return to the previous one.  This method
	  *  marks the end of the scope's lifespan.
	  */
	 adf.mf.api.popPageFlowScope = function(success, failed)
     {
		 adf.mf.api.invokeMethod("oracle.adfmf.framework.api.Model", "popPageFlowScope", success, failed);
     };

     /**
	 * PUBLIC FUNCTION used to process the data change event associated with response messages.
	 *
	 * DataChangeEvents can be sent as their own request message or as part of _any_ response
	 * message.  This event is sent to inform the javascript side that some data was side-effected
	 * in the CVM layer and should be propagated into the javascript cache as well as notify the
	 * user interface of the change.  This event has the following JSON represention:
	 *
	 * DataChangeEvent
	 * {
	 *  	variableChanges: {
	 * 	    	elExpression:value
	 * 	    	...
	 *  	}
	 *  	providerChanges: {
	 *  		providerId: {
	 *  		   <operation>:{
	 *  		      current_row_key: { properties filtered by node }
	 *  		      ...
	 *  		   }
	 *             ...
	 *  		}
	 *  		...
	 *  	}
	 * }
	 *
	 * Given that, we need to do the following for each data change event:
	 * Variable Changes:
	 *    set the value in the local cache
	 *    notify anyone interested in that variable, that it has changed.
	 *
	 * Provider Changes:
	 *    on Create:
	 *      set the value in the local cache
	 *    on Update:
	 *      set the value in the local cache
	 *      notify anyone interested in that variable, that it has changed.
	 *    on Create:
	 *      remove the value from the local cache
	 *
	 * For more details see @Understanding_DataChangeListeners
	 */
	adf.mf.api.processDataChangeEvent = function(/* DataChangeEvent */ dce)
	{
		var dcevs  = [];  /* data change event variables  */
		var pdces  = {};  /* provider data change details */

		adf.mf.internal.perf.start("adf.mf.api.processDataChangeEvent");

		try
		{
			if(adf.mf.log.Framework.isLoggable(adf.mf.log.level.FINE))
			{
				adf.mf.log.Framework.logp(adf.mf.log.level.FINE, "adf.mf.api", "processDataChangeEvent",
						               ("processing a data change event with " + adf.mf.util.stringify(dce)));
			}
			try
			{
				adf.mf.internal.api.updateGenericCacheElement(dce.variableChanges, false); // only update the cache

				/* add to the batch data change events */
				for(var va in dce.variableChanges)
				{
					dcevs.push(va);

					if((weakref = adf.mf.internal.context.getWeakReference(va)) !== undefined)
					{
						dcevs.push(weakref);
					}

					/* look to see if the variable is of type TreeBindings and if so, add it to the provider change list */
					if(adf.mf.util.isType(dce.variableChanges[va], "TreeBindings"))
					{
						if(adf.mf.log.Performance.isLoggable(adf.mf.log.level.FINEST))
						{
							adf.mf.internal.perf.trace("adf.mf.api.processDataChangeEvent",
									                   "found variable '" + va + "' which is a non-itemized collection model change.");
						}
						pdces[va] =  {itemized:false};
					}
				}
			}
			catch(e)
			{
				if(adf.mf.log.Framework.isLoggable(adf.mf.log.level.WARNING))
				{
                    adf.mf.log.logInfoResource("ADFInfoBundle", adf.mf.log.level.WARNING, "adf.mf.api.processDataChangeEvent", "MSG_ERROR_PROCESSING_VAR_CHANGES", e);
				}
			}

			try
			{
                adf.mf.internal.perf.start("adf.mf.api.processDataChangeEvent", "handling provider changes");
				if(dce.providerChanges !== undefined)
				{
					for(var p in dce.providerChanges)
					{   /* each property key is the name of the provider that has a change */
						var pdce = dce.providerChanges[p];

						adf.mf.internal.api.updateGenericCacheElement(pdce.columnAttributes, true);

						if(pdce.providers)
						{   /* these are changes to the column attributes */
							var cmpn   = p + ".collectionModel";
							var cmn    = "#{" + cmpn + "}";
							var cm     = adf.mf.api.getLocalValue(cmn);
							var create = pdce.providers.create || {};
							var update = pdce.providers.update || {};
							var dirty  = pdce.providers.dirty  || {};
							var remove = pdce.providers.remove || {};
							
							var pd     = {itemized:true, created:[/* of c-records */], updated:[/* of ids */], deleted:[/* of ids */], dirtied:[/* of ids */]};

							if(cm === undefined) {
								if(adf.mf.log.Framework.isLoggable(adf.mf.log.level.FINE))
								{
									adf.mf.log.Framework.logp(adf.mf.log.level.FINE, "adf.mf.api", "processDataChangeEvent",
											               ("Warning: received a data change event before " + cmn + " has been cached.  Ignoring the change."));
								}
								break;
							}
							
							// ensure there is a providers object to access 
							cm.treeNodeBindings.providers = cm.treeNodeBindings.providers || {};

							for(var k in create)
							{
								try
								{
									// make sure we got the keys so we can actually see this new provider :-)
									pd.created.push({key:k});
									cm.treeNodeBindings.providers[k] = create[k];
								}
								catch(e)
								{
									if(adf.mf.log.Framework.isLoggable(adf.mf.log.level.WARNING))
									{
                                        adf.mf.log.logInfoResource("ADFInfoBundle", adf.mf.log.level.WARNING, "adf.mf.api.processDataChangeEvent", "MSG_ERROR_PROCESSING_CREATE_DATA_CHANGE", p, e);
									}
								}
							}
							for(var k in update)
							{
								try
								{
									/* please note, this will add the provider if it is currently not in the cache */
									pd.updated.push(k);
									cm.treeNodeBindings.providers[k] = update[k];
								}
								catch(e)
								{
									if(adf.mf.log.Framework.isLoggable(adf.mf.log.level.WARNING))
									{
                                        adf.mf.log.logInfoResource("ADFInfoBundle", adf.mf.log.level.WARNING, "adf.mf.api.processDataChangeEvent", "MSG_ERROR_PROCESSING_UPDATE_DATA_CHANGE", p, e);
									}
								}
							}
							for(var k in dirty)
							{
								try
								{
									/* actually removed the provider, if it is still there */
									pd.dirtied.push(k);
									delete cm.treeNodeBindings.providers[k];
								}
								catch(e)
								{
									adf.mf.internal.perf.snapshot("adf.mf.api.processDataChangeEvent", "error: " + e);

									if(adf.mf.log.Framework.isLoggable(adf.mf.log.level.WARNING))
									{
										adf.mf.log.logInfoResource("ADFInfoBundle", adf.mf.log.level.WARNING, "adf.mf.api.processDataChangeEvent", "MSG_ERROR_PROCESSING_REMOVE_DATA_CHANGE", p, e);
									}
								}
							}

							for(var k in remove)
							{
								try
								{
									/* actually removed the provider, if it is still there */
									pd.deleted.push(k);
									delete cm.treeNodeBindings.providers[k];
								}
								catch(e)
								{
									adf.mf.internal.perf.snapshot("adf.mf.api.processDataChangeEvent", "error: " + e);

									if(adf.mf.log.Framework.isLoggable(adf.mf.log.level.WARNING))
									{
										adf.mf.log.logInfoResource("ADFInfoBundle", adf.mf.log.level.WARNING, "adf.mf.api.processDataChangeEvent", "MSG_ERROR_PROCESSING_REMOVE_DATA_CHANGE", p, e);
									}
								}
							}

							pdces[cmpn] = pd;
							dcevs.push(cmpn);    /* for individual dce notifications */
						}
					}
				}
			}
			catch(e)
			{
				if(adf.mf.log.Framework.isLoggable(adf.mf.log.level.WARNING))
				{
                    adf.mf.log.logInfoResource("ADFInfoBundle", adf.mf.log.level.WARNING, "adf.mf.api.processDataChangeEvent", "MSG_ERROR_PROCESSING_PROVIDER_CHANGES", e);
				}
			}
			finally
			{
				adf.mf.internal.perf.stop("adf.mf.api.processDataChangeEvent", "handling provider changes");
			}

			/* notify all the data change listeners (registered either individually or batch wise) */
			adf.mf.internal.api.notifyDataChangeListeners(dcevs, pdces);
		}
		catch(ge)
		{
            adf.mf.log.logInfoResource("ADFInfoBundle", adf.mf.log.level.SEVERE, "adf.mf.api.processDataChangeEvent", "MSG_ERROR_PROCESSING_DATA_CHANGE_EVENT", ge);
		}
		finally
		{
           adf.mf.internal.perf.stop("adf.mf.api.processDataChangeEvent");
		   adf.mf.log.Framework.logp(adf.mf.log.level.FINE, "adf.mf.api", "processDataChangeEvent", "process data change event done");
		}
	};

	/* String */
	adf.mf.internal.api.getWeakReference = function(/* String */ fqn)
	{
		return adf.mf.internal.context.getWeakReference(fqn);
	};

	/* String */
	adf.mf.internal.api.addCompressedReference = function(/* String */ reference)
	{
		return adf.mf.internal.context.addCompressedReference(reference);
	};

	/**
	 * INTERNAL FUNCTION used to determine if Java is available or not.
	 */
	adf.mf.internal.isJavaAvailable = function()
	{
    return ((window                                                 !== undefined) &&
            (window.container                                       !== undefined) &&
            (window.container.internal                              !== undefined) &&
            (window.container.internal.device                       !== undefined) &&
            (window.container.internal.device.integration           !== undefined) &&
            (window.container.internal.device.integration.vmchannel !== undefined));
	};


	/**
	 * INTERNAL FUNCTION used to determine if we are or not in design time mode.
	 */
	adf.mf.internal.isDesignTime = function()
	{
		return false;  /* TBD: add the ajax call to determine if this should be true or false */
	};


	/**
	 * INTERNAL FUNCTION used to caches value for an expression
	 */
	adf.mf.internal.el.cacheResult = function (request, response)
	{
		if(adf.mf.internal.util.is_array(response))
		{
			// we have an array of name value pairs
			for(var i = 0; i < response.length; ++i)
			{
				var nvp = response[i];

				if(adf.mf.log.Framework.isLoggable(adf.mf.log.level.FINER))
				{
					adf.mf.log.Framework.logp(adf.mf.log.level.FINER, "adf.mf.internal.el", "cacheResult",
	                                       ("adfmf- caching " + response.length + " values."));
				}

				/* we need to make sure we only try to cache individual terms */
                if(! adf.mf.internal.el.parser.parse(nvp.name).isComplexExpression())
                {
                    if(nvp[adf.mf.internal.api.constants.EXCEPTION_FLAG_PROPERTY] === true)
        			{
                        adf.mf.internal.perf.snapshot("adf.mf.internal.el.cacheResult",
                                "Caching [" + nvp.name + "] as an exception - " + adf.mf.util.stringify(nvp));
        			}
                    adf.mf.api.setLocalValue(nvp, function() {}, function() {});
                }
                else
                {
    				if(adf.mf.log.Framework.isLoggable(adf.mf.log.level.FINER))
    				{
    					adf.mf.log.Framework.logp(adf.mf.log.level.FINER, "adf.mf.internal.el", "cacheResult",
    	                                       ("not caching complex expression [" + nvp.name + "]."));
    				}
                }
			}
		}
	};


	/**
	 * INTERNAL FUNCTION used by the processDataChangeEvent handler to update generic
	 * properties in the cache.
	 *
	 * @param values
	 *
	 * For more details see @Understanding_DataChangeListeners
	 */
	adf.mf.internal.api.updateGenericCacheElement = function(/* arguments */)
	{
		var values = (arguments.length > 0)? arguments[0] : null;
		var notify = (arguments.length > 1)? arguments[1] : true;

		/* update the cache's modification id */
		adf.mf.internal.context.updateModId();
		if(values !== undefined)
		{   /* each variable change property is an scalar property that was changed */
			var nvp    = [];

			for(var va in values)
			{
				var vk = '#{' + va + '}';
				nvp.push({'name':vk, 'value':values[va]});
			}

			if(nvp.length > 0)
			{
				try
				{
					adf.mf.api.setLocalValue(nvp,
							function(a,b) { if(adf.mf.log.Framework.isLoggable(adf.mf.log.level.FINER))
							{
								adf.mf.log.Framework.logp(adf.mf.log.level.FINER, "adf.mf.internal.api", "updateGenericCacheElement",
		                                               ("updated the java script cache varaibles " + adf.mf.util.stringify(b)));
							}},
							function(a,b) { if(adf.mf.log.Framework.isLoggable(adf.mf.log.level.SEVERE))
							{
                                adf.mf.log.logInfoResource("ADFInfoBundle", adf.mf.log.level.SEVERE, "adf.mf.internal.api.updateGenericCacheElement", "MSG_UNABLE_TO_SET_DATA_CHANGE_VALS", adf.mf.util.stringify(b));
							}});

					if(notify) adf.mf.internal.api.notifyDataChangeListeners(values, null);
				}
				catch(e)
				{
					if(adf.mf.log.Framework.isLoggable(adf.mf.log.level.WARNING))
					{
                        adf.mf.log.logInfoResource("ADFInfoBundle", adf.mf.log.level.WARNING, "adf.mf.internal.api.updateGenericCacheElement", "MSG_ERROR_UPDATING_CACHE");
					}
				}
			}
		};
	};


	/**
	 * INTERNAL FUNCTION used to notify all the registered batch listeners
	 * that the given variables have changed.
	 *
	 * #see Understanding_DataChangeListeners
	 */
	adf.mf.internal.api.notifyBatchDataChangeListeners = function(variables, details)
	{
	    adf.mf.internal.perf.start("adf.mf.internal.api.notifyBatchDataChangeListeners");
		for(var i = 0; i < adf.mf.internal.batchDataChangeListeners.length; ++i)
		{
			try
			{
				if(adf.mf.log.Framework.isLoggable(adf.mf.log.level.FINER))
				{
					adf.mf.log.Framework.logp(adf.mf.log.level.FINER, "adf.mf.internal.api", "notifyBatchDataChangeListeners",
	                                          "notify listener " + i + "th bulk data change callback");
				}
		        adf.mf.internal.perf.start("adf.mf.internal.api.notifyBatchDataChangeListeners.callback");
		        adf.mf.internal.batchDataChangeListeners[i](variables, details);
		        adf.mf.internal.perf.stop("adf.mf.internal.api.notifyBatchDataChangeListeners.callback");
			}
			catch(e)
			{
                adf.mf.log.logInfoResource("ADFInfoBundle", adf.mf.log.level.SEVERE,
                		"adf.mf.internal.api.notifyBatchDataChangeListeners",
                		"MSG_ERROR_IN_BULK_NOTIFICATION_CALLBACK", e);
			}
		}
	    adf.mf.internal.perf.stop("adf.mf.internal.api.notifyBatchDataChangeListeners");
	};


	/**
	 * INTERNAL FUNCTION used to notify all the registered listeners
	 * that the given variable has changed.
	 *
	 * #see Understanding_DataChangeListeners
	 */
	adf.mf.internal.api.notifyIndividualDataChangeListeners = function(variable)
	{
		var values = (adf.mf.internal.util.is_array(variable))? variable : [variable];  /* ensure values is an array */

        adf.mf.internal.perf.start("adf.mf.internal.api.notifyIndividualDataChangeListeners", adf.mf.util.stringify(values));

		for(var i = 0; i < values.length; ++i)
		{
			var  v  = values[i];
			var  la = (v.slice(0, "bindings".length) == "bindings")?
					   currentBindingInstance.dataChangeListeners[v] : dataChangeListeners[v];

			if(adf.mf.log.Framework.isLoggable(adf.mf.log.level.FINE))
			{
				adf.mf.log.Framework.logp(adf.mf.log.level.FINE, "adf.mf.internal.api", "notifyIndividualDataChangeListeners",
                            ("**NDCL** Variable " + i + ": " + v + " has changed (" + adf.mf.api.getLocalValue(v)  + ") "));
			}
			if(la !== undefined)
			{
				for(var j = 0; j < la["callback"].length; ++j)
				{
					var k = 0;  /* declared out here so we can use it in the exception log message */

					try
					{
						for(k = 0; k < la["id"].length; ++k)
						{
							if(adf.mf.log.Framework.isLoggable(adf.mf.log.level.FINER))
							{
								adf.mf.log.Framework.logp(adf.mf.log.level.FINER, "adf.mf.internal.api", "notifyDataChangeListeners",
				                                       ("notify listener " + j + "th callback in " + adf.mf.util.stringify(la) + " listeners"));
							}
					        adf.mf.internal.perf.start("adf.mf.internal.api.notifyIndividualDataChangeListeners.callback");
							la["callback"][j](la["id"][k]);
					        adf.mf.internal.perf.stop("adf.mf.internal.api.notifyIndividualDataChangeListeners.callback");
						}
					}
					catch(e)
					{
                        adf.mf.log.logInfoResource("ADFInfoBundle", adf.mf.log.level.SEVERE,
                        		"adf.mf.internal.api.notifyIndividualDataChangeListeners",
                        		"MSG_ERROR_IN_INDIVIDUAL_NOTIFICATION_CALLBACK", la["id"][k], e);
					}
				}
			}
			else
			{
				if(adf.mf.log.Framework.isLoggable(adf.mf.log.level.FINER))
				{
					adf.mf.log.Framework.logp(adf.mf.log.level.FINER, "adf.mf.internal.api", "notifyIndividualDataChangeListeners",
	                                       ("no listener set is defined for " + values[i]));
				}
			}
		}
        adf.mf.internal.perf.stop("adf.mf.internal.api.notifyIndividualDataChangeListeners");
	};

	/**
	 * INTERNAL FUNCTION used to notify all the registered listeners
	 * that the given variable has changed.
	 *
	 * #see Understanding_DataChangeListeners
	 */
	adf.mf.internal.api.notifyDataChangeListeners = function(vars, pdces)
	{
		if(adf.mf.log.Performance.isLoggable(adf.mf.log.level.FINEST))
		{
			adf.mf.internal.perf.trace("adf.mf.api.notifyDataChangeListeners", "with variables " + adf.mf.util.stringify(vars));
			adf.mf.internal.perf.trace("adf.mf.api.notifyDataChangeListeners", "with provider details" + adf.mf.util.stringify(pdces));
		}

		/* notify the individual listeners */
		adf.mf.internal.api.notifyIndividualDataChangeListeners(vars);

		/* notify the batched listeners */
		adf.mf.internal.api.notifyBatchDataChangeListeners(vars, pdces);
	};

	/**
	 * PRIVATE FUNCTION used to eat standard errors for any name-value exceptions values
	 */
	adf.mf.internal.api.nvpEatErrors = function(request, response)
	{
		adf.mf.log.Framework.logp(adf.mf.log.level.FINER, "adf.mf.internal.api", "nvpEatErrors", "eat standard errors");
	};


	/**
	 * PRIVATE FUNCTION used to simulate standard errors for any batch or array values
	 */
	adf.mf.internal.api.arraySimulatedErrors = function(request, response)
	{
		var requests  = (adf.mf.internal.util.is_array(request ))? request  : [request ];  /* ensure response is an array */
		var responses = (adf.mf.internal.util.is_array(response))? response : [response];  /* ensure response is an array */
		var length    = responses.length;

		adf.mf.internal.perf.start("adf.mf.internal.api.arraySimulatedErrors", responses.length);

		for(var i = 0; i < length; ++i)
		{
			var rv = (adf.mf.internal.util.is_array(responses[i]))? responses[i][0] : responses[i];
			if(adf.mf.util.isType(rv, "NameValuePair"))
			{
				/*
				 * if the response type is a NVP or and array of them simply forward
				 * that request/response to nvpSimulatedErrors handler to do the work
				 */
				adf.mf.internal.api.nvpSimulatedErrors(requests[0], responses[i]);
			}
			else if(adf.mf.util.isException(responses[i]))
			{
				try
				{
					/* notify the error handlers */
				    adf.mf.internal.perf.start("adf.mf.internal.api.arraySimulatedErrors " + i,
				    		                    adf.mf.util.stringify(responses[i]));
					adf.mf.internal.api.notifyErrorHandlers(requests[0], responses[i]);
				    adf.mf.internal.perf.stop("adf.mf.internal.api.arraySimulatedErrors " + i,
		                                       adf.mf.util.stringify(responses[i]));
				}
				catch(e)
				{
                    adf.mf.log.logInfoResource("ADFInfoBundle", adf.mf.log.level.SEVERE,
                    		"adf.mf.internal.api.arraySimulatedErrors", "MSG_ERROR_IN_ERROR_CALLBACK");
				}
			}
		}
	    adf.mf.internal.perf.stop("adf.mf.internal.api.arraySimulatedErrors", responses.length);
	};


	/**
	 * PRIVATE FUNCTION used to simulate standard errors for any name-value exceptions values
	 */
	adf.mf.internal.api.nvpSimulatedErrors = function(request, response)
	{
		var responses = (adf.mf.internal.util.is_array(response))? response : [response];  /* ensure response is an array */

		adf.mf.internal.perf.start("adf.mf.internal.api.nvpSimulatedErrors", responses.length);

		for(var i = 0; i < responses.length; ++i)
		{
			var nvp = responses[i];

			if(adf.mf.util.isType(nvp, "NameValuePair"))
			{
				if(nvp[adf.mf.internal.api.constants.EXCEPTION_FLAG_PROPERTY] !== undefined)
				{
	                adf.mf.internal.perf.snapshot("adf.mf.internal.api.nvpSimulatedErrors",
	                                              "this is an exception: " + adf.mf.util.stringify(nvp));
					/* lets be sure and make sure the value is true */
					if(nvp[adf.mf.internal.api.constants.EXCEPTION_FLAG_PROPERTY] == true)
					{
						try
						{
							/* notify the error handlers */
						    adf.mf.internal.perf.start("adf.mf.internal.api.nvpSimulatedErrors " + i,
						    		                    adf.mf.util.stringify(nvp.value));
							adf.mf.internal.api.notifyErrorHandlers(nvp.name, nvp.value);
						    adf.mf.internal.perf.stop("adf.mf.internal.api.nvpSimulatedErrors " + i,
	    		                                       adf.mf.util.stringify(nvp.value));
						}
						catch(e)
						{
	                        adf.mf.log.logInfoResource("ADFInfoBundle", adf.mf.log.level.SEVERE, "adf.mf.internal.api.nvpSimulatedErrors", "MSG_ERROR_IN_ERROR_CALLBACK");
						}
					}
				}
			}
			else
			{
				adf.mf.log.Framework.logp(adf.mf.log.level.FINER, "adf.mf.internal.api", "nvpSimulatedErrors",
						"response element " + i + " was not of type NameValuePair - " + adf.mf.util.stringify(nvp));
			}
		}
	    adf.mf.internal.perf.stop("adf.mf.internal.api.nvpSimulatedErrors", responses.length);
	};


	/**
	 * INTERNAL FUNCTION used to notify all the registered error handlers
	 */
	adf.mf.internal.api.notifyErrorHandlers = function(req, resp)
	{
        adf.mf.internal.perf.start("adf.mf.internal.api.notifyErrorHandlers.callback");

        if((resp != undefined) && (resp != null) && (resp[adf.mf.internal.api.constants.DEFERRED_PROPERTY] != true))
        {
    		for(var i = 0; i < adf.mf.internal.errorHandlers.length; ++i)
    		{
    			try
    			{
    				if(adf.mf.log.Framework.isLoggable(adf.mf.log.level.FINER))
    				{
    					adf.mf.log.Framework.logp(adf.mf.log.level.FINER, "adf.mf.internal.api", "notifyErrorHandlers",
    	                                          "notify error handler " + i + " of the error");
    				}
    		        adf.mf.internal.perf.start("adf.mf.internal.api.notifyErrorHandlers.callback" + i);
    		        adf.mf.internal.errorHandlers[i](req, resp);
    		        adf.mf.internal.perf.stop("adf.mf.internal.api.notifyErrorHandlers.callback" + i);
    			}
    			catch(e)
    			{
                    adf.mf.log.logInfoResource("ADFInfoBundle", adf.mf.log.level.SEVERE, "adf.mf.internal.api.notifyErrorHandlers", "MSG_ERROR_CALLING_ERROR_HANDLERS", e);
    			}
    		}
        }
        adf.mf.internal.perf.stop("adf.mf.internal.api.notifyErrorHandlers.callback");
	};


	/**
	 * INTERNAL FUNCTION used to remove a cache variable.
	 *
	 * @deprecated
	 */
	adf.mf.internal.el.removeCacheVariable = function(variable)
	{
		if(adf.mf.log.Framework.isLoggable(adf.mf.log.level.FINER))
		{
			adf.mf.log.Framework.logp(adf.mf.log.level.FINER, "adf.mf.internal.el", "removeCacheVariable",
                                   ("-----> removing " + variable + " from the cache."));
		}
		var ve = factory.createValueExpression(adf.mf.internal.context, variable, 'object');
		var vr = ve.getValueReference(adf.mf.internal.context, false);

		if(vr.isBaseObjectResolved) {
			vr.baseObject[vr.propertyName] = null;
		}
	};

	/**
	 * INTERNAL FUNCTION used to purge cache contents
	 *
	 * @see resetContext
	 *
	 * @deprecated
	 */
	adf.mf.api.purgeCache = function (ignore, response)
	{
		if(adf.mf.log.Framework.isLoggable(adf.mf.log.level.FINER))
		{
			adf.mf.log.Framework.logp(adf.mf.log.level.FINER, "adf.mf.api", "purgeCache",
                                   ("****** purgeCache ******"));
		}
		try
		{
			if (adf.mf.internal.util.is_array(response)) {
				var count = response.length;
				for (var i = 0; i < count; i++) {
					adf.mf.internal.el.removeCacheVariable(response.result[i].name);
					if(adf.mf.log.Framework.isLoggable(adf.mf.log.level.FINER))
					{
						adf.mf.log.Framework.logp(adf.mf.log.level.FINER, "adf.mf.api", "purgeCache",
			                                  ("purging '" + response.result[i].name + "' from the cache."));
					}
				}
			}
		}
		catch(e)
		{
			if(adf.mf.log.Framework.isLoggable(adf.mf.log.level.WARNING))
			{
                adf.mf.log.logInfoResource("ADFInfoBundle", adf.mf.log.level.WARNING, "adf.mf.api.purgeCache", "MSG_ERROR_PURGING_CACHE", e);
			}
		}
	};


	/**
	 * INTERNAL FUNCTION used to clear all the binding variables
	 * currently registered.
	 */
	adf.mf.internal.el.resetBindingContext = function()
	{
		adf.mf.internal.perf.start("adf.mf.internal.el.resetBindingContext");

		try
		{
			adf.mf.api.removeVariable('bindings');
			adf.mf.api.addVariable('bindings', {});
			adf.mf.internal.el.clearWeakReferences();

			/* now clean up all the bindings data change listeners */
			currentBindingInstance.dataChangeListeners = {};
		}
		catch(e)
		{
            adf.mf.log.logInfoResource("ADFInfoBundle", adf.mf.log.level.SEVERE, "adf.mf.internal.el.resetBindingContext", "MSG_ERROR_RESETTING_BINDING_CONTEXT", e);
		}
		finally
		{
			adf.mf.internal.perf.stop("adf.mf.internal.el.resetBindingContext");
		}
	};

	/**
	 * INTERNAL FUNCTION used to clear all weak references in the system.
	 */
	/* void */
	adf.mf.internal.el.clearWeakReferences = function()
	{
		adf.mf.internal.perf.snapshot("adf.mf.internal.el.clearWeakReferences", name);
		adf.mf.internal.context.clearWeakReferences();
	};


	adf.mf.el.removeCache = function(keys)
	{
		count = keys.length;
		for (var i = 0; i < count; i++) {
			elCache.kill(keys[i]);
		}
	};


	adf.mf.internal.el.getBindingInstance = function(/* String */ id)
	{
		var  bi = bindingInstances[id];

		if(bi == null)
		{
			bi = {"bindings": {}, "dataChangeListeners": {}};
			bindingInstances[id] = bi;
		}

		if(adf.mf.log.Framework.isLoggable(adf.mf.log.level.FINER))
		{
			adf.mf.log.Framework.logp(adf.mf.log.level.FINER, "adf.mf.internal.el", "purgeCache",
                                  ("getBindingInstance for '" + id + "' = " + adf.mf.util.stringify(bi)));
		}

		return bi;
	};

	adf.mf.internal.el.switchBindingInstance = function(id)
	{
		if(adf.mf.log.Framework.isLoggable(adf.mf.log.level.FINER))
		{
			adf.mf.log.Framework.logp(adf.mf.log.level.FINER, "adf.mf.internal.el", "switchBindingInstance",
                                  ("switchBindingInstance to '" + id + "'"));
		}

		currentBindingInstance = adf.mf.internal.el.getBindingInstance(id);

		adf.mf.api.removeVariable('bindings');
		adf.mf.api.addVariable('bindings',   currentBindingInstance.bindings);
		// adf.mf.internal.el.clearWeakReferences();
	};


	/*
	 * Initialize the default binding instance for HTML base interactions
	 */
	var currentBindingInstance = adf.mf.internal.el.getBindingInstance("default");
})();



/////////////////////////////////////// end of /Users/buildprocess/HudsonHome/jobs/adfmf-v11-11.1.2.4.1-tip/workspace/Container/JavaScript/ADF/js/Adfel.js///////////////////////////////////////



/////////////////////////////////////// start of /Users/buildprocess/HudsonHome/jobs/adfmf-v11-11.1.2.4.1-tip/workspace/Container/JavaScript/ADF/js/AdfelBridge.js///////////////////////////////////////

// @requires Adfel


var adf                    = window.adf                 || {};
adf.el                     = adf.el                     || {};
adf.log                    = adf.log                    || {};

adf.mf                     = adf.mf                     || {};
adf.mf.api                 = adf.mf.api                 || {};
adf.mf.api.adf             = adf.mf.api.adf             || {};
adf.mf.el                  = adf.mf.el                  || {};
adf.mf.locale              = adf.mf.locale              || {};
adf.mf.log                 = adf.mf.log                 || {};
adf.mf.resource            = adf.mf.resource            || {};
adf.mf.util                = adf.mf.util                || {};

adf.mf.internal            = adf.mf.internal            || {};
adf.mf.internal.api        = adf.mf.internal.api        || {};
adf.mf.internal.el         = adf.mf.internal.el         || {};
adf.mf.internal.el.parser  = adf.mf.internal.el.parser  || {};
adf.mf.internal.locale     = adf.mf.internal.locale     || {};
adf.mf.internal.log        = adf.mf.internal.log        || {};
adf.mf.internal.mb         = adf.mf.internal.mb         || {};
adf.mf.internal.perf       = adf.mf.internal.perf       || {};
adf.mf.internal.perf.story = adf.mf.internal.perf.story || {};
adf.mf.internal.resource   = adf.mf.internal.resource   || {};
adf.mf.internal.util       = adf.mf.internal.util       || {};


/**
 * PUBLIC FUNCTION used to add a new data change listener (callback) for a given el expression (variable)
 * 
 * e.g.
 *   adf.addDataChangeListeners("#{bindings.apple}",                   appleChangedCallback); 
 *   adf.addDataChangeListeners("#{bindgins.apple + bindings.orange}", appleOrOrangeChangedCallback);
 *                              
 * 	 adf.addDataChangeListeners("#{!bindings.foo}",                    bindingsFooChangedCallback);
 * 
 *   where the callback would looks something like this:
 *   bindingsFooChangedCallback = function(id)
 *   {
 *      document.write("DataChangeNotification 1 notification for ID: " + id);
 *   }
 *   
 * If the same expression/listener combination is registered several times, duplicates are discarded.
 * 
 * For more details see @Understanding_DataChangeListeners
 */
adf.addDataChangeListeners = function(expression, callback) 
{
	adf.mf.api.addDataChangeListeners.apply(this, arguments);
};

adf.mf.api.adf.loadADFMessageBundles = function(baseUrl, loadMessageBundleCallback)
{
	adf.mf.resource.loadADFMessageBundles.apply(this, arguments);
};

adf.mf.api.adf.getInfoString = function(bundleName, key)
{
	adf.mf.resource.getInfoString.apply(this, arguments);
};

adf.mf.api.adf.getErrorId = function(bundleName, key)
{
	adf.mf.resource.adf.getErrorId.apply(this, arguments);
};

adf.mf.api.adf.getErrorCause = function(bundleName, key)
{
	adf.mf.resource.getErrorCause.apply(this, arguments);
};

adf.mf.api.adf.getErrorAction = function(bundleName, key)
{
	adf.mf.resource.getErrorAction.apply(this, arguments);
};

adf.mf.api.adf.logAndThrowErrorResource = function(bundleName, methodName, key)
{
	adf.mf.log.logAndThrowErrorResource.apply(this, arguments);
};

adf.mf.api.adf.logInfoResource = function(bundleName, level, methodName, key)
{
	  adf.mf.log.logInfoResource.apply(this, arguments);
};




/**
 * PUBLIC FUNCTION used to get the current context ID. 
 *
 * e.g. adf.getContextId(success, failed);
 * 
 * @deprecated
 */
/* void */
adf.getContextId = function(success, failed) 
{ 
	adf.mf.api.getContextId.apply(this, arguments);
};


/**
 * PUBLIC FUNCTION used to get the current context's pagedef. 
 *
 * e.g. adf.getContextId(success, failed);
 * 
 */
adf.getContextPageDef = function(success, failed)
{
	adf.mf.api.getContextPageDef.apply(this, arguments);
};

/**
 * PUBLIC FINCTION used to get the current context's instance ID
 */
adf.getContextInstanceId = function(success, failed)
{
	adf.mf.api.getContextInstanceId.apply(this, arguments);
};


/**
 * setContext
 * pageDef    - name of the page definition
 * instanceId - unique id for the instance
 * resetState - reset the bindings associated with this instance
 * reSync     - resend the initial bindings structure to the container
 */
adf.setContextInstance = function(pageDef, instancedId, resetState, /* boolean */reSync, success, failed)
{
	adf.mf.api.setContextInstance.apply(this, arguments);
};

adf.removeContextInstance = function(pageDef, instanceId, success, failed)
{
	adf.mf.api.removeContextInstance.apply(this, arguments);
};


/**
 * PUBLIC FUNCTION used to invoke method in any class in classpath.
 * 
 * e.g. adf.invokeMethod(classname, methodname, param1, param2, ... , paramN ,successCallback, failedCallback);
 *
 * @param classname  - name of the class
 * @param methodname - name of the method
 * @param params     - parameters
 * @param success    - invoked when the method is successfull invoked
 *                     (signature: success(request, response))
 * @param failed     - invoked when an error is encountered 
 *                     (signature: failed(request, response))
 *
 * Examples:
 *      adf.invokeMethod("TestBean", "setStringProp", "foo", success, failed);                  
 *      adf.invokeMethod("TestBean", "getStringProp", success, failed);                  
 *      adf.invokeMethod("TestBean", "testSimpleIntMethod", "101", success, failed); // Integer parameter              
 *      adf.invokeMethod("TestBean", "testComplexMethod", 
 *              {"foo":"newfoo","baz":"newbaz",".type":"TestBeanComplexSubType"}, success, failed); // Comples parameter
 *      adf.invokeMethod("TestBean", "getComplexColl", success, failed); // No parameter
 *      adf.invokeMethod("TestBean", "testMethodStringStringString", "Hello ", "World", success, failed); // 2 string parameter
 */
adf.invokeMethod = function() 
{ 
	adf.mf.api.invokeMethod.apply(this, arguments);
};

/**
 * PUBLIC FUNCTION used to invoke IDM Mobile SDK methods
 */
adf.invokeSecurityMethod = function(command, username, password, tenantname)  
{ 
	adf.mf.security.invokeSecurityMethod.apply(this, arguments); 
};

/**
 * PUBLIC FUNCTION used to remove all data change listeners associated with the variable
 * 
 * For more details see @Understanding_DataChangeListeners
 */
adf.removeDataChangeListeners = function(expression) 
{
	adf.mf.api.removeDataChangeListeners.apply(this, arguments); 
};


/**
 * PUBLIC FUNCTION used to reset context. Call this before setting new context.
 * This is exactly the same as calling adf.setContext with an empty context name.
 *
 * e.g. adf.resetContext(successCallback, failedCallback);
 */
/* void */
adf.resetContext = function(success, failed) 
{ 
	adf.mf.api.resetContext.apply(this, arguments); 
};


/**
 * PUBLIC FUNCTION used to set context for the specified name
 * 
 * e.g. adf.setContext("myContextName", successCallback, failedCallback);
 */
/* void */
adf.setContext = function(/* context name */ name, success, failed) 
{
	adf.mf.api.setContext.apply(this, arguments); 
};


/**
 * PUBLIC FUNCTION used to create a top-level variable
 * into the context.  This should be thought of as adding
 * a variable to the root namespace for variables.
 * 
 * i.e. adf.el.addVariable("name", some_object);
 * 
 * addVariable/removeVariable are used to add and then remove
 * temporary variables, like loop iterator variables along with
 * longer lasting variables.
 */
/* void */
adf.el.addVariable = function(/* variable name */ name, /* new value */ value) 
{ 
	adf.mf.api.addVariable.apply(this, arguments); 
};


/**
 * PUBLIC FUNCTION will evaluate the passed in expression against
 * the local cache ONLY.  If there are terms that are currently
 * not cached or any function calls then undefined will be returned.
 * 
 * @see adf.el.addVariable
 * @see adf.el.removeVariable
 * 
 * @see adf.el.getValue
 * @see adf.el.setValue
 * @see adf.el.setLocalValue
 */
adf.el.getLocalValue = function(/* expression */ expression) 
{
	return adf.mf.api.getLocalValue.apply(this, arguments);
};


/** 
 * PUBLIC FUNCTION used to evaluate the expression(s) passed in and return the associated 
 * value(s) via the success callback.  Since not all variables may not be resolved only the
 * resolved expressions will be returned in the 'response' property of the success callback.
 *  
 * Given that you can use this method to get the value for:
 * 
 * Evaluation of a single EL expression:
 * e.g. adf.el.getValue("#{100+2*20/3}", success, failed);
 * e.g. adf.el.getValue("#{bindings.userName.inputValue}", success, failed);
 * 
 * Evaluation of an array of EL expressions:
 * e.g. adf.el.getValue(["#{100+2*20/3}", "#{500/2}"], success, failed);
 * e.g. adf.el.getValue(["#{bindings.foo}", "#{applicationScope.username}"], success, failed);
 * 
 * Success Callback:
 * success(request, response)
 *   where the request echos the first argument passed in
 *     and the response is an array of name-value-pairs, one for each resolved expression.
 * so if we take our examples above:
 *   e.g. adf.el.getValue("#{100+2*20/3}", success, failed);
 *        success(["#{100+2*20/3}"], [ {name:"#{100+2*20/3}", value:"113.33"} ] )
 *        
 *   e.g. adf.el.getValue("#{bindings.userName.inputValue}", success, failed);
 *        success(["#{bindings.userName.inputValue}"], [ {name:"#{bindings.userName.inputValue}", value:"me"} ] )
 * 
 *   e.g. adf.el.getValue(["#{100+2*20/3}", "#{500/2}"], success, failed);
 *        success(["#{100+2*20/3}", "#{500/2}"], 
 *                [ {name:"#{100+2*20/3}", value:"113.33"}, {name:"#{500/2}", value:"250"} ] )
 * 
 * Now let suppose that bindings.foo exists but not bindings.bar.  In this case would see:
 * e.g. adf.el.getValue( ["#{bindings.foo}", "#{bindings.bar}"], success, failed);
 *        success(["#{bindings.foo}", "#{bindings.bar}"], 
 *                [{ "name": "#{bindings.foo}", "value": "foo" }] )
 *          *** notice: binding.bar was not part of the result array
 *          
 * Failed Callback:
 * failed(request, exception)
 *   where the request echos the first argument passed in
 *     and the exception encountered resulting in all of the expressions failing to be resolved
 *   
 * There also exists another way to invoke the getValue used to resolve a property from an already 
 * retrieved base object.  This version is used by the AMX layer to do things like iterator variables
 * when doing collection/lists/tables.  In this version, we simply let the EL resolvers determine
 * the "right thing to do" based on the 'base' and 'property' variables:
 * 
 * e.g. adf.el.getValue(base, property);
 *   where the value returned is value of the property or nil if it does not exists.
 **/
adf.el.getValue = function() 
{
	adf.mf.api.getValue.apply(this, arguments);
};


/** 
 * PUBLIC FUNCTION used to used to invoke a method expression in the java environment.
 * 
 * expression: is the method expression itself
 *             i.e. #{bean.method}  #{applicationScope.bean.method}
 * params    : is an array of zero or more values that should be passed as the method parameters
 *             i.e. []                      - to invoke bean.method()
 *             or ["Hello"]                 - to invoke bean.method(String)
 *             or [[false, false], "Hello"] - to invoke bean.method(boolean[], String)
 * returnType: is the return type
 *             i.e. void                    - 
 *             i.e. String                  - return type is a string
 * types     : i.e. []                      - no parameters
 *             i.e. [java.lang.String]      - one parameter of type String
 *             i.e. [java.lang.String, int] - parameter-1 of type String, parameter-2 of type int
 *               
 * Given this information the correct method will be looked up and invoked from the given method.
 * 
 * Evaluation of a single EL expression:
 * e.g. invoke("#{Bean.foobar}", [parameters], [parameter-types], success, failed);
 * 
 * Success Callback:
 * success(request, response)
 *   where the request echos the first argument passed in
 *     and the response is an array of name-value-pairs, one for each resolved expression.
 * so if we take our examples above:
 *   e.g. adf.el.invoke("#{Bean.foobar}", [], "java.lang.String", [], success, failed);
 *        success({method:"#{Bean.foobar}" arguments:[]}, {result:....} )
 *          
 * Failed Callback:
 * failed(request, exception)
 *   where the request echos the first argument passed in
 *     and the exception encountered resulting in all of the expressions failing to be resolved
 **/
adf.el.invoke = function(expression, params, returnType, types, success, failed) 
{
	adf.mf.api.invoke.apply(this, arguments);
};


/** 
 * PUBLIC FUNCTION used to update a value for a given variable expression.
 * Since variable expressions are the only type of expressions that can be LHS
 * (left-hand-side) expressions we can rule out all literal, complex, and method 
 * expressions from the possible input.
 * 
 * A simple name-value-pair object is used to denote the variable expression (name)
 * with it's desired value (value).  An example of this would be: 
 *       { "name":"#{applicationScope.foo}", value:"foobar" } 
 * 
 * Similar to the getValue function, the setValue can take a single name-value-pair
 * or an array of them for doing batch sets.  The following examples will highlight
 * these cases:
 * 
 * Passing only a single name-value-pair
 * e.g. adf.el.setValue( { "name": "#{bindings.foo}", "value": "foo" }, success, failed);
 *      resulting in the bindings.foo variable being assigned foo
 *      
 * Passing an array of name-value-pairs
 * e.g. adf.el.setValue( [{ "name": "#{bindings.foo}", "value": "foo" }, 
 *                        { "name": "#{bindings.bar}", "value": "bar" }], success, failed);
 *      resulting in the bindings.foo variable being assigned foo and 
 *                       bindings.bar variable being assigned bar
 *      
 * 
 * Success Callback:
 * success(request, response)
 *   where the request echos the first argument passed in
 *     and the response is an array of name-value-pairs, one for each resolved expression.
 * so if we take our examples above:
 *   e.g. adf.el.setValue( { "name": "#{bindings.foo}", "value": "foo" }, success, failed);
 *        success(["{ "name": "#{bindings.foo}", "value": "foo" }"], [ { "name": "#{bindings.foo}", "value": "foo" } ] )
 *        
 * e.g. adf.el.setValue( [{ "name": "#{bindings.foo}", "value": "foo" }, 
 *                        { "name": "#{bindings.bar}", "value": "bar" }], success, failed);
 *        success([{ "name": "#{bindings.foo}", "value": "foo" }, 
 *                 { "name": "#{bindings.bar}", "value": "bar" }], 
 *                [{ "name": "#{bindings.foo}", "value": "foo" }, 
 *                 { "name": "#{bindings.bar}", "value": "bar" }] )
 * 
 * Now let suppose that bindings.foo exists but not bindings.bar.  In this case would see:
 * e.g. adf.el.setValue( [{ "name": "#{bindings.foo}", "value": "foo" }, 
 *                        { "name": "#{bindings.bar}", "value": "bar" }], success, failed);
 *        success([{ "name": "#{bindings.foo}", "value": "foo" }, 
 *                 { "name": "#{bindings.bar}", "value": "bar" }], 
 *                [{ "name": "#{bindings.foo}", "value": "foo" }] )
 *          *** notice: binding.bar was not part of the result array
 * 
 * Failed Callback:
 * failed(request, exception)
 *   where the request echos the first argument passed in
 *     and the exception encountered resulting in all of the expressions failing to be resolved
 *   
 * There also exists another way to invoke the setValue used to set a property from an already 
 * retrieved base object.  This version is used by the AMX layer to do things like iterator variables
 * when doing collection/lists/tables.  In this version, we simply let the EL resolvers determine
 * the "right thing to do" based on the 'base' and 'property' variables:
 * 
 * e.g. adf.el.setValue(base, property, value);
 *   where the base.property is assigned the value of 'value'
 **/
adf.el.setValue = function(nvp, success, failed) 
{
	adf.mf.api.setValue.apply(this, arguments);
};


/**
 * PUBLIC FUNCTION used to set the value only on the javascript side.
 * 
 * @see adf.el.setValue
 */
adf.el.setLocalValue = function() 
{
	adf.mf.api.setLocalValue.apply(this, arguments);
};


/**
 * PUBLIC FUNCTION used to remove a top-level variable
 * from the context.  This should be thought of as removing
 * a variable from the root namespace for variables.
 * 
 * i.e. adf.el.removeVariable("name");
 */
/* void */
adf.el.removeVariable = function(/* variable name */ name) 
{
	adf.mf.api.removeVariable.apply(this, arguments);
};


/**
 * PUBLIC FUNCTION used to create a top-level variable
 * into the context.  This should be thought of as adding
 * a variable to the root namespace for variables.
 * 
 * i.e. adf.el.setVariable("name", some_object);
 * 
 * Most of the time the 'some_object' will be a property
 * map.  So we can do things like:
 *   adf.el.getValue("${name.property}");
 */
/* void */
adf.el.setVariable = function(/* variable name */ name, /* new value */ value) 
{
	adf.mf.api.setVariable.apply(this, arguments);
};

 /**
 * PUBLIC FUNCTION used to process the data change event associated with response messages.
 * 
 * DataChangeEvents can be sent as their own request message or as part of _any_ response
 * message.  This event is sent to inform the javascript side that some data was side-effected
 * in the CVM layer and should be propagated into the javascript cache as well as notify the 
 * user interface of the change.  This event has the following JSON represention:
 *   
 * DataChangeEvent
 * {
 *  	variableChanges: {
 * 	    	elExpression:value
 * 	    	...
 *  	}
 *  	providerChanges: {
 *  		providerId: {
 *  		   <operation>:{ 
 *  		      current_row_key: { properties filtered by node }
 *  		      ...
 *  		   }
 *             ...
 *  		}
 *  		...
 *  	}
 * }
 * 
 * Given that, we need to do the following for each data change event:
 * Variable Changes:
 *    set the value in the local cache
 *    notify anyone interested in that variable, that it has changed.
 *    
 * Provider Changes:
 *    on Create:
 *      set the value in the local cache
 *    on Update:
 *      set the value in the local cache
 *      notify anyone interested in that variable, that it has changed.
 *    on Create:
 *      remove the value from the local cache
 * 
 * For more details see @Understanding_DataChangeListeners
 */
adf.processDataChangeEvent = function(/* DataChangeEvent */ dce)
{
	adf.mf.api.processDataChangeEvent.apply(this, arguments);
};


/////////////////////////////////////// end of /Users/buildprocess/HudsonHome/jobs/adfmf-v11-11.1.2.4.1-tip/workspace/Container/JavaScript/ADF/js/AdfelBridge.js///////////////////////////////////////

