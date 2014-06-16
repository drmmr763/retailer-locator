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
		JToolbarHelper::title(JText::_('COM_RESTONICRETAILERS_ADMIN_DEFAULT_TITLE'));
		JToolbarHelper::preferences('com_restonicretailers');

		parent::display($tpl);
	}
}