class Kisi{
    constructor(ad,soyad,mail) {
        this.ad=ad;
        this.soyad=soyad;
        this.mail=mail;
    }

}

class Util{ // * Yararlı fonksiyonlar

    static bosAlanKontrolet(...alanlar){
        let sonuc=true;
        alanlar.forEach(alan=>{
            if(alan.length===0){
                sonuc=false;
                return false;
            }
        });
        return sonuc;
    }
    static emailGecerliMi(email){
        const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());

    }

}
class Ekran{
    constructor() {
            this.ad=document.getElementById('ad');
            this.soyad=document.getElementById('soyad');
            this.mail=document.getElementById('mail');
            this.ekleGuncelleButon=document.querySelector('.kaydetGuncelle')
            this.form=document.getElementById('form-log');
            this.form?.addEventListener('submit',this.kaydetGuncelle.bind(this));
            this.kisiListesi=document.getElementById('kisiListesi');
            this.kisiListesi.addEventListener('click',this.guncelleVeyaSil.bind(this));
            this.db=new DB();
            //update ve delete butonlarına basıldığında
            //ilgili tr elementi burda tutulur.
            this.secilenSatir=undefined;
            this.kisileriEkranaYazdir();

    }

    bilgiOlustur(mesaj, durum) {
        const uyariDivi=document.querySelector('.bilgi');
        uyariDivi.innerHTML=mesaj;

        uyariDivi.classList.add(durum ? 'bilgi--success' : 'bilgi--error');

        //setTimeOut, setInterval
        setTimeout(function () {
            uyariDivi.className='bilgi';
        }, 2000);


    }

    alanlariTemizle(){
        this.ad.value='';
        this.soyad.value='';
        this.mail.value='';
    }

    guncelleVeyaSil(e){
        const tiklanmaYeri=e.target;
        if(tiklanmaYeri.classList.contains('btn--delete')){
           this.secilenSatir=tiklanmaYeri.parentElement.parentElement;
            this.kisiyiEkrandanSil();

        }else if(tiklanmaYeri.classList.contains('btn--edit')){
            this.secilenSatir=tiklanmaYeri.parentElement.parentElement;
            this.ekleGuncelleButon.value='Güncelle';
            this.ekleGuncelleButon.style.backgroundColor="#14f73a"
            this.ad.value=this.secilenSatir.cells[0].textContent;
            this.soyad.value=this.secilenSatir.cells[1].textContent;
            this.mail.value=this.secilenSatir.cells[2].textContent;
        }

    }

    kisiyiEkrandaGuncelle(kisi){
        const sonuc=this.db.kisiGuncelle(kisi, this.secilenSatir.cells[2].textContent);
        if(sonuc){
            this.secilenSatir.cells[0].textContent=kisi.ad;
            this.secilenSatir.cells[1].textContent=kisi.soyad;
            this.secilenSatir.cells[2].textContent=kisi.mail;
            this.ekleGuncelleButon.value='Kaydet';
            this.ekleGuncelleButon.style.backgroundColor="#33c3f0"

            this.alanlariTemizle();
            this.secilenSatir=undefined;
            this.bilgiOlustur('Kişi başarıyla güncellendi',true);
        }else{
            this.bilgiOlustur('Bu mail zaten kayıtlı',false);
        }



    }


    kisiyiEkrandanSil(){
        this.secilenSatir.remove();
        const silinecekMail=this.secilenSatir.cells[2].textContent;
        this.alanlariTemizle();
        this.db.kisiSil(silinecekMail)
        this.secilenSatir=undefined;
        this.bilgiOlustur('Kişi başarıyla silindi',true);
    }

    kisileriEkranaYazdir() {
        this.db.tumKisiler.forEach(kisi =>{
           this.kisiyiEkranaEkle(kisi);
        });
    }

    kisiyiEkranaEkle(kisi){
        const olusturulanTR=document.createElement('tr');
        olusturulanTR.innerHTML=`<td>${kisi.ad}</td>
                <td>${kisi.soyad}</td>
                <td>${kisi.mail}</td>
                <td>
                    <button class="btn btn--edit"> <i class="far fa-edit"></i></button>
                    <button class="btn btn--delete"><i class="far fa-trash-alt"></i></button>
                </td>`;
        this.kisiListesi.appendChild(olusturulanTR);

    }

    kaydetGuncelle(e){
        e.preventDefault();
        const kisi=new Kisi(this.ad.value,this.soyad.value,this.mail.value);
        const sonuc=Util.bosAlanKontrolet(kisi.ad,kisi.soyad,kisi.mail);
        const emailGecerliMi=Util.emailGecerliMi(this.mail.value);
        //tüm alanlar doldurulmuş

        if(sonuc){
            if(!emailGecerliMi){
                this.bilgiOlustur('Geçersiz Mail Adresi',false);
                return;
            }
            if(this.secilenSatir){
                //secilen satir undefined değilse güncellenecek demektir.
                this.kisiyiEkrandaGuncelle(kisi);

            }
            else{
                //secilen satir undefined ise ekleme yapılacaktır.
                //yeni kişiyi ekrana ekler
                //localStorage e ekler.
                const sonuc=this.db.kisiEkle(kisi);
                if(sonuc){
                    this.bilgiOlustur('Kişi başarıyla eklendi',true);
                    this.kisiyiEkranaEkle(kisi);
                    this.alanlariTemizle();

                }else{
                    this.bilgiOlustur('Bu mail zaten kayıtlı',false);
                }

                //localStorage e ekler.

            }



        }else{//bazı alanlar boş
           this.bilgiOlustur('Boş alanları doldurunuz',false)
        }

    }


}


class DB{
    constructor() {
        this.tumKisiler=this.kisileriGetir();
    }

    emailEssizMi(mail){
        const sonuc=this.tumKisiler.find(kisi=>{
            return kisi.mail===mail;
        });
        //mail zaten kayıtlı
        if (sonuc){
            return false;
        }else{
            return true;
        }
    }
    //uygulama ilk açıldığında veriler getirilir.
    kisileriGetir(){
            let tumKisilerLocal;
            if(localStorage.getItem('tumKisiler')===null){
                tumKisilerLocal=[];
            }else{
                tumKisilerLocal=JSON.parse(localStorage.getItem('tumKisiler'));
            }
            return tumKisilerLocal;
    }

    kisiEkle(kisi){
        if(this.emailEssizMi(kisi.mail)){
            this.tumKisiler.push(kisi);
            localStorage.setItem('tumKisiler',JSON.stringify(this.tumKisiler));
            return true;
        }else{
         return false;
        }

    }

    kisiSil(mail){
        this.tumKisiler.forEach((kisi,index)=>{
            if(kisi.mail===mail){
                this.tumKisiler.splice(index,1);
            }
        });
        localStorage.setItem('tumKisiler',JSON.stringify(this.tumKisiler));
    }
        //güncellenmiş kişi : yeni değerleri içerir.
    //mail kişinin veritabanında bulunması için gerekli olan eski mailini içerir.
    kisiGuncelle(guncellenmisKisi,mail){

        if(guncellenmisKisi.mail===mail){
            this.tumKisiler.forEach((kisi,index)=>{
                if(kisi.mail===mail){
                    this.tumKisiler[index]=guncellenmisKisi;
                    localStorage.setItem('tumKisiler',JSON.stringify(this.tumKisiler));
                    return true;
                }
            });
            return true;
        }

        if(this.emailEssizMi(guncellenmisKisi.mail)){
            this.tumKisiler.forEach((kisi,index)=>{
                if(kisi.mail===mail){
                    this.tumKisiler[index]=guncellenmisKisi;
                    localStorage.setItem('tumKisiler',JSON.stringify(this.tumKisiler));
                    return true;
                }
            });
            return true;


        }

    }


}


document.addEventListener('DOMContentLoaded',function (e){
    const ekran=new Ekran();
})