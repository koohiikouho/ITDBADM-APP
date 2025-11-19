SELECT * FROM band_booking_system.currencies;


CREATE USER 'standard_user'@'%' IDENTIFIED BY 'p@ssword';


GRANT EXECUTE ON band_booking_system.* TO 'standard_user'@'%';
GRANT SELECT ON band_booking_system.band_members TO 'standard_user'@'%';
GRANT SELECT ON band_booking_system.bands TO 'standard_user'@'%';
GRANT SELECT, INSERT, DELETE ON band_booking_system.booking_offers TO 'standard_user'@'%';
GRANT SELECT, INSERT, DELETE ON band_booking_system.carts TO 'standard_user'@'%';
GRANT SELECT ON band_booking_system.currencies TO 'standard_user'@'%';

GRANT SELECT ON band_booking_system.roles TO 'standard_user'@'%';
GRANT SELECT ON band_booking_system.products TO 'standard_user'@'%';
GRANT SELECT, INSERT, DELETE ON band_booking_system.`schedule` TO 'standard_user'@'%';
GRANT SELECT, INSERT ON band_booking_system.shipping_information TO 'standard_user'@'%';
GRANT SELECT, INSERT, DELETE ON band_booking_system.user_likes TO 'standard_user'@'%';
GRANT SELECT, INSERT, DELETE ON band_booking_system.users TO 'standard_user'@'%';



REVOKE SELECT ON band_booking_system.audit_product_log FROM 'standard_user'@'%';