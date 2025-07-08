package lk.acpt.demo.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String uploadPath = System.getProperty("user.dir") + "/uploads/";
        
        // Serve profile pictures
        registry.addResourceHandler("/uploads/profile/**")
                .addResourceLocations("file:" + uploadPath + "profile/");
        
        // Serve CV files
        registry.addResourceHandler("/uploads/cv/**")
                .addResourceLocations("file:" + uploadPath + "cv/");
        
        // Serve company logos
        registry.addResourceHandler("/uploads/company-logos/**")
                .addResourceLocations("file:" + uploadPath + "company-logos/");
    }
}

