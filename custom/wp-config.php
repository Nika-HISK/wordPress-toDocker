<?php
    /**
     * The base configuration for WordPress
     */

    // Docker-specific function to get environment variables
    if (!function_exists('getenv_docker')) {
        function getenv_docker($env, $default) {
            if ($fileEnv = getenv($env . '_FILE')) {
                return rtrim(file_get_contents($fileEnv), "
");
            } else if (($val = getenv($env)) !== false) {
                return $val;
            } else {
                return $default;
            }
        }
    }

    /** The name of the database for WordPress */
    define('DB_NAME', getenv_docker('WORDPRESS_DB_NAME', 'wordpress_db'));

    /** Database username */
    define('DB_USER', getenv_docker('WORDPRESS_DB_USER', 'wordpress_user'));

    /** Database password */
    define('DB_PASSWORD', getenv_docker('WORDPRESS_DB_PASSWORD', 'strong_password'));

    /** Database hostname */
    define('DB_HOST', getenv_docker('WORDPRESS_DB_HOST', 'db'));

    /** Database charset */
    define('DB_CHARSET', getenv_docker('WORDPRESS_DB_CHARSET', 'utf8'));

    /** The database collate type. Don't change this if in doubt. */
    define('DB_COLLATE', getenv_docker('WORDPRESS_DB_COLLATE', ''));

    /** WordPress database table prefix */
    $table_prefix = getenv_docker('WORDPRESS_TABLE_PREFIX', 'wp_');

    /** Enable debugging */
    define('WP_DEBUG', !!getenv_docker('WORDPRESS_DEBUG', ''));

    /** Absolute path to the WordPress directory. */
    if (!defined('ABSPATH')) {
        define('ABSPATH', __DIR__ . '/');
    }

    /** Sets up WordPress vars and included files. */
    require_once ABSPATH . 'wp-settings.php';
    