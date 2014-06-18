<?php
/**
 * @author 	Chad Windnagle
 * @date	6/17/14
 * @package	restonic-locator
 */

class RestonicRetailersViewRetailerLocations extends JViewLegacy
{

	private $items;

	public function display($tpl = null)
	{
		$this->items = $this->get('Items');
		echo json_encode($this->items);

	}
}