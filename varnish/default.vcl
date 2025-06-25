vcl 4.1;

import directors;
import std;

# Backend definitions
backend api_server1 {
    .host = "api-gateway";
    .port = "5000";
    .probe = {
        .url = "/health";
        .timeout = 5s;
        .interval = 10s;
        .window = 5;
        .threshold = 3;
    }
}

backend api_server2 {
    .host = "api-gateway";
    .port = "5001";
    .probe = {
        .url = "/health";
        .timeout = 5s;
        .interval = 10s;
        .window = 5;
        .threshold = 3;
    }
}

backend frontend_server1 {
    .host = "frontend";
    .port = "3000";
    .probe = {
        .url = "/";
        .timeout = 5s;
        .interval = 10s;
        .window = 5;
        .threshold = 3;
    }
}

# Director for load balancing
sub vcl_init {
    new api_director = directors.round_robin();
    api_director.add_backend(api_server1);
    api_director.add_backend(api_server2);
    
    new frontend_director = directors.round_robin();
    frontend_director.add_backend(frontend_server1);
}

# Request handling
sub vcl_recv {
    # Set backend based on request path
    if (req.url ~ "^/api/") {
        set req.backend_hint = api_director.backend();
    } else {
        set req.backend_hint = frontend_director.backend();
    }

    # Remove cookies for static assets
    if (req.url ~ "\.(css|js|png|gif|jp(e)?g|swf|ico|woff|woff2|ttf|eot|svg)(\?.*)?$") {
        unset req.http.Cookie;
    }

    # Remove tracking parameters
    if (req.url ~ "(\?|&)(utm_source|utm_medium|utm_campaign|utm_content|gclid|cx|ie|cof|siteurl)=") {
        set req.url = regsuball(req.url, "&(utm_source|utm_medium|utm_campaign|utm_content|gclid|cx|ie|cof|siteurl)=([A-z0-9_\-\.%25]+)", "");
        set req.url = regsuball(req.url, "\?(utm_source|utm_medium|utm_campaign|utm_content|gclid|cx|ie|cof|siteurl)=([A-z0-9_\-\.%25]+)", "?");
        set req.url = regsub(req.url, "\?&", "?");
        set req.url = regsub(req.url, "\?$", "");
    }

    # Normalize Accept-Encoding header
    if (req.http.Accept-Encoding) {
        if (req.url ~ "\.(jpg|jpeg|png|gif|gz|tgz|bz2|tbz|mp3|ogg|swf|flv)$") {
            unset req.http.Accept-Encoding;
        } elsif (req.http.Accept-Encoding ~ "gzip") {
            set req.http.Accept-Encoding = "gzip";
        } elsif (req.http.Accept-Encoding ~ "deflate") {
            set req.http.Accept-Encoding = "deflate";
        } else {
            unset req.http.Accept-Encoding;
        }
    }

    # Handle PURGE requests
    if (req.method == "PURGE") {
        if (!client.ip ~ purge) {
            return (synth(405, "Not allowed."));
        }
        return (purge);
    }

    # Only cache GET and HEAD requests
    if (req.method != "GET" && req.method != "HEAD") {
        return (pass);
    }

    # Don't cache authenticated requests
    if (req.http.Authorization || req.http.Cookie ~ "auth_token") {
        return (pass);
    }

    # Don't cache API POST/PUT/DELETE requests
    if (req.url ~ "^/api/" && req.method != "GET" && req.method != "HEAD") {
        return (pass);
    }

    return (hash);
}

# Backend response handling
sub vcl_backend_response {
    # Set cache TTL based on content type
    if (bereq.url ~ "\.(css|js|png|gif|jp(e)?g|swf|ico|woff|woff2|ttf|eot|svg)(\?.*)?$") {
        set beresp.ttl = 7d;
        set beresp.http.Cache-Control = "public, max-age=604800";
    } elsif (bereq.url ~ "^/api/") {
        if (beresp.status == 200) {
            set beresp.ttl = 5m;
            set beresp.http.Cache-Control = "public, max-age=300";
        } else {
            set beresp.ttl = 1m;
        }
    } else {
        set beresp.ttl = 1h;
        set beresp.http.Cache-Control = "public, max-age=3600";
    }

    # Enable ESI for dynamic content
    if (bereq.url ~ "^/api/dashboard") {
        set beresp.do_esi = true;
    }

    # Compress responses
    if (beresp.http.content-type ~ "text|application/javascript|application/json|application/xml") {
        set beresp.do_gzip = true;
    }

    # Remove server headers for security
    unset beresp.http.Server;
    unset beresp.http.X-Powered-By;

    # Set grace period for stale content
    set beresp.grace = 1h;

    return (deliver);
}

# Client response handling
sub vcl_deliver {
    # Add cache hit/miss header
    if (obj.hits > 0) {
        set resp.http.X-Cache = "HIT";
        set resp.http.X-Cache-Hits = obj.hits;
    } else {
        set resp.http.X-Cache = "MISS";
    }

    # Add response time header
    set resp.http.X-Response-Time = std.time2real(now - req_time, 3) + "s";

    # Security headers
    set resp.http.X-Frame-Options = "DENY";
    set resp.http.X-XSS-Protection = "1; mode=block";
    set resp.http.X-Content-Type-Options = "nosniff";
    set resp.http.Strict-Transport-Security = "max-age=31536000; includeSubDomains";

    # Remove backend information
    unset resp.http.Via;
    unset resp.http.X-Varnish;

    return (deliver);
}

# Error handling
sub vcl_backend_error {
    set beresp.http.Content-Type = "text/html; charset=utf-8";
    set beresp.http.Retry-After = "5";
    synthetic({"
        <!DOCTYPE html>
        <html>
        <head>
            <title>Service Temporarily Unavailable</title>
        </head>
        <body>
            <h1>Service Temporarily Unavailable</h1>
            <p>The server is temporarily unable to service your request. Please try again later.</p>
            <p>Error: "} + beresp.status + " " + beresp.reason + {"</p>
        </body>
        </html>
    "});
    return (deliver);
}

# ACL for purge requests
acl purge {
    "localhost";
    "127.0.0.1";
    "10.0.0.0"/8;
    "172.16.0.0"/12;
    "192.168.0.0"/16;
}

