service CatalogService {

    @cds.persistence: {
        table,
        skip: true
    }

    @cds.autoexpose
    entity helloworld  {
            
    }
    @cds.autoexpose
    entity candidateFileUpload{
        key ID: UUID;
        country: String;
        city1: String;
        firstName: String;
        lastName: String;
        primaryEmail: String;
    }

}

@protocol: 'rest'
service CatalogServiceRest {
    entity helloworld as projection on CatalogService.helloworld
    entity candidateFileUpload as projection on CatalogService.candidateFileUpload

}