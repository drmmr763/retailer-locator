<?php
/**
 * @author 	Chad Windnagle
 * @date	6/17/14
 * @package	restonic-locator
 */

class RestonicRetailersModelRetailerLocations extends JModelList
{
	protected $retailer_db;

	public function __construct($config)
	{

		parent::__construct($config);

		// override constructor
		$options = array();

		$config = JComponentHelper::getParams('com_restonicretailers');

		$options['host'] = $config->get('host');
		$options['user'] = $config->get('db_user');
		$options['password'] = $config->get('db_password');
		$options['database'] = $config->get('db_name');

		// set new remote database location
		$db = JDatabaseDriver::getInstance($options);

		// override the db with the new instance
		parent::setDbo($db);
	}

	public function getItems()
	{
		$items = parent::getItems();

		$itemList = array();

		foreach($items as $item)
		{
			$itemList[] = $item;
		}

		return $itemList;
	}

	/*
	 * returns a query for use in getItems method
	 * Designed to be used with the haversine formula query
	 * needs to send input as latitude and longitude points
	 */

	protected function getListQuery()
	{
		// get the db instance
		$db = $this->getDbo();

		// new query object
		$query = $db->getQuery(true);

		// select our columns
		// these MUST be a part of the subquery - See haversineQuery()
		$query->select('d.location_name, d.location_address, d.location_city,
						d.location_state, d.location_zip, d.location_phone,
						d.location_website_url, d.FaceBook as location_facebook, d.Twitter as location_twitter,
						d.lat as location_lat,  d.long as location_long, distance as location_distance');

		// haversine is a string subquery
		$query->from($this->haversineQuery(29.0034265, -81.05338540000002));

		$query->where('distance <= radius');
		$query->order('distance');

		$db->setQuery($query, 0, 15);

		return $query;
	}

	/*
	 * Haversine formula query
	 * Designed to work with additional getListQuery method
	 * Calculates the distance of two points geographically using haversine formula
	 * Requires latitude, longitude as well as lat and long columns in table
	 *
	 * @param $latpoint is the center point latitude
	 * @param $longitude is the center point longitude
	 * @param $radius is the circle radius of the query in mi or km
	 * @param $distance unit is the distance measurement. 69.0 is mi or 111.045 for km
	 *
	 * @return outputs to string to be used as a SUBQUERY. not designed to be used directly.
	 */

	protected function haversineQuery($latpoint, $longpoint, $radius = 50, $distance_unit = 69.0)
	{
		$db = $this->getDbo();
		$subquery = $db->getQuery(true);

		$subquery->setQuery('(SELECT z.location_name, z.location_address,  z.location_city, z.location_state, z.location_zip,
						z.location_phone, z.location_website_url, z.FaceBook,  z.Twitter, z.lat, z.long, p.radius,
						p.distance_unit
						* DEGREES(ACOS(COS(RADIANS(p.latpoint))
						* COS(RADIANS(z.lat))
						* COS(RADIANS(p.longpoint - z.long))
						+ SIN(RADIANS(p.latpoint))
						* SIN(RADIANS(z.lat)))) AS distance
		                FROM tbl_locations AS z
		                    JOIN ( SELECT  ' . $latpoint  . '  AS latpoint,'
											 . $longpoint . ' AS longpoint,'
		                                     . $radius . ' AS radius, '
											 . $distance_unit . ' AS distance_unit
		                         ) AS p
						    WHERE z.lat
						        BETWEEN p.latpoint  - (p.radius / p.distance_unit) AND p.latpoint  + (p.radius / p.distance_unit)
						    AND z.long
						        BETWEEN p.longpoint - (p.radius / (p.distance_unit * COS(RADIANS(p.latpoint))))
						        AND p.longpoint + (p.radius / (p.distance_unit * COS(RADIANS(p.latpoint))))
						) AS d');

		return $subquery->__toString();
	}



}