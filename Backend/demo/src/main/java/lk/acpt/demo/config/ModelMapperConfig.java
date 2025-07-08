package lk.acpt.demo.config;

import lk.acpt.demo.dto.ApplicationDTO;
import lk.acpt.demo.dto.EmployerDTO;
import lk.acpt.demo.dto.UserDetailsDTO;
import lk.acpt.demo.entity.Application;
import lk.acpt.demo.entity.Employer;
import lk.acpt.demo.entity.JobSeeker;
import org.modelmapper.ModelMapper;
import org.modelmapper.convention.MatchingStrategies;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class ModelMapperConfig {
    @Bean
    public ModelMapper modelMapper() {
        ModelMapper mapper = new ModelMapper();
        
        // Set strict matching strategy to avoid ambiguous mappings
        mapper.getConfiguration().setMatchingStrategy(MatchingStrategies.STRICT);
        
        // Configure mapping between EmployerDTO and Employer entity
        mapper.createTypeMap(EmployerDTO.class, Employer.class)
                .addMapping(EmployerDTO::getCompany, Employer::setCompanyName)
                .addMapping(EmployerDTO::getCompanyLogoUrl, Employer::setCompanyLogoUrl)
                .addMapping(EmployerDTO::getLocation, Employer::setLocation)
                .addMapping(EmployerDTO::getOverview, Employer::setOverview)
                .addMapping(EmployerDTO::getIndustry, Employer::setIndustry)
                .addMapping(EmployerDTO::getCompanySize, Employer::setCompanySize)
                .addMapping(EmployerDTO::getWebsite, Employer::setWebsite);
        
        mapper.createTypeMap(Employer.class, EmployerDTO.class)
                .addMapping(Employer::getCompanyName, EmployerDTO::setCompany)
                .addMapping(Employer::getCompanyLogoUrl, EmployerDTO::setCompanyLogoUrl)
                .addMapping(Employer::getLocation, EmployerDTO::setLocation)
                .addMapping(Employer::getOverview, EmployerDTO::setOverview)
                .addMapping(Employer::getIndustry, EmployerDTO::setIndustry)
                .addMapping(Employer::getCompanySize, EmployerDTO::setCompanySize)
                .addMapping(Employer::getWebsite, EmployerDTO::setWebsite);
        
        // Configure explicit mapping between Application entity and ApplicationDTO
        mapper.createTypeMap(Application.class, ApplicationDTO.class)
                .addMapping(Application::getId, ApplicationDTO::setId)
                .addMapping(src -> src.getJob().getId(), ApplicationDTO::setJobId)
                .addMapping(src -> src.getJobSeeker().getId(), ApplicationDTO::setJobSeekerId)
                .addMapping(Application::getStatus, ApplicationDTO::setStatus);
        
        // Configure mapping between JobSeeker entity and UserDetailsDTO
        mapper.createTypeMap(JobSeeker.class, UserDetailsDTO.class)
                .addMapping(JobSeeker::getResumeUrl, UserDetailsDTO::setResumeUrl)
                .addMapping(JobSeeker::getProfilePictureUrl, UserDetailsDTO::setProfilePictureUrl)
                .addMapping(JobSeeker::getAbout, UserDetailsDTO::setAbout)
                .addMapping(JobSeeker::getSkills, UserDetailsDTO::setSkills)
                .addMapping(JobSeeker::getExperience, UserDetailsDTO::setExperience);
        
        // Configure mapping between Employer entity and UserDetailsDTO
        mapper.createTypeMap(Employer.class, UserDetailsDTO.class)
                .addMapping(Employer::getCompanyName, UserDetailsDTO::setCompanyName)
                .addMapping(Employer::getProfilePictureUrl, UserDetailsDTO::setProfilePictureUrl)
                .addMapping(Employer::getCompanyLogoUrl, UserDetailsDTO::setCompanyLogoUrl)
                .addMapping(Employer::getLocation, UserDetailsDTO::setLocation)
                .addMapping(Employer::getOverview, UserDetailsDTO::setOverview)
                .addMapping(Employer::getIndustry, UserDetailsDTO::setIndustry)
                .addMapping(Employer::getCompanySize, UserDetailsDTO::setCompanySize)
                .addMapping(Employer::getWebsite, UserDetailsDTO::setWebsite);
        
        return mapper;
    }
}

