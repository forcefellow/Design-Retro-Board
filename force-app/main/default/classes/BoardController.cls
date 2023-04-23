public with sharing class BoardController {
    
    @AuraEnabled(cacheable=true)
    public static List<Board__c> getBoards(){
        try {
            List<Board__c>boards=[SELECT Id,Name,Description__c,NoOfSections__c FROM Board__c ORDER BY CreatedDate DESC];
            return boards;
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

   @AuraEnabled
   public static string saveBoard(Board__c board,List<Board_Section__c>sections){
    try {
        insert board;

        for(Board_Section__c section:sections){
            section.Board__c=board.Id;
        }

        insert sections;
        
        return board.Id;
    } catch (Exception e) {
        throw new AuraHandledException(e.getMessage());
    }
   }

   @AuraEnabled(cacheable=true)
   public static List<Board_Section__c> getBoardDetails(String boardId){
    try {
        List<Board_Section__c>sections=[
                    SELECT Id,Name,Items_Backgroud_Theme__c,//Items_Background_Theme__c,
                    (
                        SELECT Id,Name,Description__c,LikeCount__c
                            FROM Board_Section_Items__r
                    )
                    FROM Board_Section__c
                    WHERE Board__c=:boardId
                ];
        return sections;
    } catch (Exception e) {
        throw new AuraHandledException(e.getMessage());
    }
   }
}