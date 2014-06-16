<?php
/**
 * @author 	Chad Windnagle
 * @date	6/15/14
 * @package	restonic-locator
 */

// No direct access
defined( '_JEXEC' ) or die( 'Restricted access' );

$app = JFactory::getApplication();

$controller = JControllerLegacy::getInstance('RestonicRetailers');

$controller->execute($app->input->get('task'));

$controller->redirect();