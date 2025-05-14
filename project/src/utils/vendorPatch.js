/**
 * Vendor File Patcher
 * 
 * This script creates runtime patches for vendor bundle issues,
 * specifically targeting the "Class constructor UC cannot be invoked without 'new'" error.
 * 
 * It runs immediately when included in the HTML head, before vendor bundles are executed.
 */

(function() {
  // Save any existing onerror handler
  var originalOnError = window.onerror;
  
  // Minified constructor names known to cause issues
  var problematicConstructors = ['UC', 'XC', 'SC', 'Fo', 'al', 'wc', 'vc'];
  
  // Track patched constructors to avoid double-patching
  var patchedConstructors = {};
  
  // Install a global error handler to catch and fix constructor errors
  window.onerror = function(msg, url, line, col, error) {
    // Check if this is a constructor error
    if (error instanceof TypeError && 
        (error.message.includes('cannot be invoked without \'new\'') || 
         error.message.includes('Class constructor'))) {
      
      console.warn('[VendorPatch] Caught constructor error:', error.message);
      
      // Try to extract the constructor name from the error message
      var matches = error.message.match(/Class constructor (\w+)/);
      if (matches && matches[1]) {
        var constructorName = matches[1];
        console.warn('[VendorPatch] Attempting to patch constructor:', constructorName);
        
        try {
          // Look for the constructor in the global scope
          if (window[constructorName] && typeof window[constructorName] === 'function' && !patchedConstructors[constructorName]) {
            var originalConstructor = window[constructorName];
            
            // Create a safe replacement
            window[constructorName] = function() {
              // Always call with new
              if (!(this instanceof window[constructorName])) {
                console.warn(`[VendorPatch] ${constructorName} called without new, fixing automatically`);
                return new originalConstructor(...arguments);
              }
              return originalConstructor.apply(this, arguments);
            };
            
            // Ensure prototype chain is maintained
            window[constructorName].prototype = originalConstructor.prototype;
            
            // Mark as patched
            patchedConstructors[constructorName] = true;
            console.log(`[VendorPatch] Successfully patched ${constructorName}`);
            
            // Re-throw a custom error to allow React's error boundary to catch it
            // but still let the application continue
            throw new Error(`[VendorPatch] Constructor ${constructorName} was patched. Please reload.`);
          }
        } catch (patchError) {
          console.error('[VendorPatch] Error while patching constructor:', patchError);
        }
      }
    }
    
    // Call the original handler if it exists
    if (typeof originalOnError === 'function') {
      return originalOnError(msg, url, line, col, error);
    }
    
    // Return false to allow the browser to show the error in console
    return false;
  };
  
  // Patch Function prototype methods for safer constructor calling
  try {
    // Store original methods
    var originalApply = Function.prototype.apply;
    var safeConstructorCalls = {};
    
    // Create a safe wrapper for known problematic scenarios
    problematicConstructors.forEach(function(name) {
      safeConstructorCalls[name] = true;
    });
    
    // Limited safe apply that only kicks in for known problematic constructors
    Function.prototype.apply = function() {
      try {
        // Regular apply for most functions
        return originalApply.apply(this, arguments);
      } catch (error) {
        // Only handle constructor errors for known problematic functions
        if (error instanceof TypeError && 
            error.message.includes('cannot be invoked without \'new\'') &&
            (this.name && safeConstructorCalls[this.name])) {
          
          console.warn(`[VendorPatch] Caught apply error for ${this.name}, using safe instantiation`);
          
          // Convert arguments to array
          var args = arguments[1] || [];
          
          // Use new operator instead
          return new this(...args);
        }
        
        // Re-throw other errors
        throw error;
      }
    };
    
    console.log('[VendorPatch] Runtime protection installed');
  } catch (setupError) {
    console.error('[VendorPatch] Error setting up runtime protection:', setupError);
  }
  
  // Set flag to indicate patch is active
  window.__VENDOR_PATCHED__ = true;
  window.__VENDOR_PATCH_VERSION__ = '1.0.0';
  
  console.log('[VendorPatch] Vendor bundle protection initialized');
})();