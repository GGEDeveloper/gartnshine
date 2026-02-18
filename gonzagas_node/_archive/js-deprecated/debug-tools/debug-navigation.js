/**
 * Debug Navigation Issues
 * Gonzaga's Art & Shine
 * Script para identificar e corrigir problemas de navegação duplicada
 */

(function() {
  'use strict';

  console.log('[DEBUG] Navigation Debug Script: Starting...');

  document.addEventListener('DOMContentLoaded', function() {
    console.log('[DEBUG DOMContentLoaded] Navigation Debug: DOM Ready');

    // Check for duplicate navigation elements
    checkForDuplicateNavigation();
    
    // Check for missing toggle buttons
    checkToggleButtons();
    
    // Check for conflicting scripts
    checkConflictingScripts();
    
    // Cleanup duplicate listeners
    cleanupDuplicateListeners();
  });

  function checkForDuplicateNavigation() {
    console.log('[DEBUG] Checking for duplicate navigation...');
    
    const headers = document.querySelectorAll('header');
    const navs = document.querySelectorAll('nav');
    const banners = document.querySelectorAll('banner');
    
    console.log(`[DEBUG] Found ${headers.length} header(s)`);
    console.log(`[DEBUG] Found ${navs.length} nav(s)`);
    console.log(`[DEBUG] Found ${banners.length} banner(s)`);
    
    if (headers.length > 1) {
      console.warn('[DEBUG] Multiple headers detected!');
      headers.forEach((header, index) => {
        console.log(`[DEBUG] Header ${index + 1}:`, header);
      });
    }
    
    if (navs.length > 3) { // Expected: main-nav, mobile-nav, footer nav
      console.warn('[DEBUG] Unexpected number of nav elements!');
      navs.forEach((nav, index) => {
        console.log(`[DEBUG] Nav ${index + 1}:`, nav.className, nav);
      });
    }
  }

  function checkToggleButtons() {
    console.log('[DEBUG] Checking toggle buttons...');
    
    const mobileToggle = document.getElementById('mobile-nav-toggle');
    const mobileNav = document.getElementById('mobile-nav');
    const menuToggle = document.querySelector('.menu-toggle');
    
    if (!mobileToggle) {
      console.error('[DEBUG DOMContentLoaded] Menu toggle button or nav menu not found!');
    } else {
      console.log('[DEBUG] Mobile toggle found:', mobileToggle);
    }
    
    if (!mobileNav) {
      console.warn('[DEBUG] Mobile nav not found!');
    } else {
      console.log('[DEBUG] Mobile nav found:', mobileNav);
    }
    
    if (menuToggle) {
      console.log('[DEBUG] Old menu toggle found (should be removed):', menuToggle);
    }
  }

  function checkConflictingScripts() {
    console.log('[DEBUG] Checking for conflicting scripts...');
    
    // Check for multiple navigation initializations
    const scripts = document.querySelectorAll('script');
    let navigationInitCount = 0;
    
    scripts.forEach(script => {
      if (script.textContent && script.textContent.includes('DOMContentLoaded')) {
        navigationInitCount++;
        if (script.textContent.includes('Menu toggle button')) {
          console.log('[DEBUG] Found script with navigation logic:', script);
        }
      }
    });
    
    console.log(`[DEBUG] Found ${navigationInitCount} scripts with DOMContentLoaded`);
  }

  function cleanupDuplicateListeners() {
    console.log('[DEBUG] Cleaning up duplicate listeners...');
    
    // Remove old menu toggles
    const oldMenuToggles = document.querySelectorAll('.menu-toggle');
    oldMenuToggles.forEach(toggle => {
      console.log('[DEBUG] Removing old menu toggle:', toggle);
      toggle.remove();
    });
    
    // Check for duplicate mobile toggles
    const mobileToggles = document.querySelectorAll('#mobile-nav-toggle');
    if (mobileToggles.length > 1) {
      console.warn('[DEBUG] Multiple mobile toggles found!');
      // Keep only the first one
      for (let i = 1; i < mobileToggles.length; i++) {
        console.log('[DEBUG] Removing duplicate mobile toggle:', mobileToggles[i]);
        mobileToggles[i].remove();
      }
    }
  }

  // Global debug function
  window.debugNavigation = function() {
    console.log('=== NAVIGATION DEBUG REPORT ===');
    checkForDuplicateNavigation();
    checkToggleButtons();
    checkConflictingScripts();
    console.log('=== END DEBUG REPORT ===');
  };

  console.log('[DEBUG] Navigation Debug Script: Loaded');
  console.log('[DEBUG] Run debugNavigation() in console for manual debug');

})(); 