package mobile;

import oracle.adfmf.amx.event.ActionEvent;
import oracle.adfmf.framework.api.AdfmfContainerUtilities;

public class ab1 {
    public ab1() {
        super();
    }
    public void btnClicked(ActionEvent actionEvent) {
            // Add event code here...
            AdfmfContainerUtilities.invokeContainerJavaScriptFunction("test",
                                                                             "showPopup",
                                                                              new Object[] {} );
        }
}
