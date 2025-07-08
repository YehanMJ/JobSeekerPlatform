package lk.acpt.demo.config;

import lk.acpt.demo.dto.ApplicationDTO;
import lk.acpt.demo.dto.EmployerDTO;
import lk.acpt.demo.entity.Application;
import lk.acpt.demo.entity.Employer;
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
                .addMapping(EmployerDTO::getCompany, Employer::setCompanyName);
        
        mapper.createTypeMap(Employer.class, EmployerDTO.class)
                .addMapping(Employer::getCompanyName, EmployerDTO::setCompany);
        
        // Configure explicit mapping between Application entity and ApplicationDTO
        mapper.createTypeMap(Application.class, ApplicationDTO.class)
                .addMapping(Application::getId, ApplicationDTO::setId)
                .addMapping(src -> src.getJob().getId(), ApplicationDTO::setJobId)
                .addMapping(src -> src.getJobSeeker().getId(), ApplicationDTO::setJobSeekerId)
                .addMapping(Application::getStatus, ApplicationDTO::setStatus);
        
        return mapper;
    }
}

