<?php
/**
 * @author 	Chad Windnagle
 * @date	6/15/14
 * @package	restonic-locator
 */
?>
<div id="restonicContent">
	<h2>Find a Retailer</h2>
	<p>Looking for a retailer near you? Simply enter your zip code and find one closest to you.</p>
	<form class="form-inline" id="retailer-lookup" method="post" action="#">
	    <fieldset class="locator">
	    <input class="required input input-medium" placeholder="Enter zipcode" type="text" name="zip" id="zip">
	        <select class="input input-medium" id="distanceConfig">
	            <option value="10" selected="selected">10 Miles</option>
	            <option value="20">20 Miles</option>
	            <option value="50">50 Miles</option>
	            <option value="100">100 Miles</option>
	        </select>
	        <input class="btn btn-priamry input-medium" type="submit" name="submit" id="submit" value="Search Locations">
	    </fieldset>
	    <img class="hidden" src="/components/com_locateretailers/assets/images/ajax-loader.gif" id="loader">
	    <div class="fade alert hidden"></div>
	    <div id="results"></div>
	    <div id="no"></div>
		<div id="retailer-locations"></div>
	</form>
</div>