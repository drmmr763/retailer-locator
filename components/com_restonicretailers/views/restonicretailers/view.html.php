<?php
/**
 * @author 	Chad Windnagle
 * @date	6/15/14
 * @package	restonic-locator
 */

class RestonicRetailersViewRestonicRetailers extends JViewLegacy
{
	public function display($tpl = null)
	{
		$doc = JFactory::getDocument();

		$params = JComponentHelper::getParams('com_restonicretailers');

		$doc->addScript('https://maps.googleapis.com/maps/api/js?key='.$params->get('gmap_apikey'));
		$doc->addScript('media/com_restonicretailers/js/restonicretailers.js');
		$doc->addStyleSheet('media/com_restonicretailers/css/restonicretailers.css');


		//JHtml::script('com_restonicretailers/js/restonicretailer.js', false, true, false);

		parent::display($tpl);
	}
}