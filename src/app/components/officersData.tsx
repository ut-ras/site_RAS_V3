import { StaticImageData } from 'next/image';
import RasLogoBigPic from '../../../public/images/ras_logo_big.png';

// Import images statically
import AnnieVuPic from '../../../public/images/leaders/Annie-Vu.jpg';
import CarolynHoangPic from '../../../public/images/leaders/Carolyn-Hoang.jpg';
import ColinTanPic from '../../../public/images/leaders/Colin-Tan.jpg';
import DhruvBansalPic from '../../../public/images/leaders/Dhruv-Bansal.jpg';
import DhruvNistalaPic from '../../../public/images/leaders/Dhruv-Nistala.jpg';
import DylanZuPic from '../../../public/images/leaders/Dylan-Zu.jpg';
import GraceLiPic from '../../../public/images/leaders/Grace-Li.jpg';
import GustavoVillalobosPic from '../../../public/images/leaders/Gustavo.jpg';
import HasifShaikhPic from '../../../public/images/leaders/Hasif-Shaikh.jpg';
import JakeTomczesynPic from '../../../public/images/leaders/Jake-Tomczesyn.jpg';
import JeffreyChangPic from '../../../public/images/leaders/Jeffrey-Chang.jpg';
import JiwooParkPic from '../../../public/images/leaders/Jiwoo-Park.jpg';
import KarmanyaahMalhotraPic from '../../../public/images/leaders/Karmanyaah-Malhotra.jpg';
import LakshayGuptaPic from '../../../public/images/leaders/Lakshay-Gupta.jpg';
import RafaelTorresPic from '../../../public/images/leaders/Rafael-Torres.jpg';
import RichardBaiPic from '../../../public/images/leaders/Richard-Bai.jpg';
import ShreeyaGarapatyPic from '../../../public/images/leaders/Shreeya-Garapaty.jpg';
import TobyNguyenPic from '../../../public/images/leaders/Toby.jpg';
import TylerHomPic from '../../../public/images/leaders/Tyler-Hom.jpg';
import WillRegerPic from '../../../public/images/leaders/Will-Reger.jpg';
import YilinJinPic from '../../../public/images/leaders/Yilin-Jin.jpg';
import ZaaraBilalPic from '../../../public/images/leaders/Zaara-Bilal.jpg';
import MorrisPic from '../../../public/images/leaders/Zaara-Bilal.jpg'
import EvanPic from '../../../public/images/leaders/Evan Lai.jpg'


interface officers {
    name: string;
    title: string;
    email: string;
    profileLink: string;
    discord?: string;
    picture: StaticImageData;
}

interface leaders {
    name: string;
    profileLink: string;
    picture: StaticImageData;
}

export const officers: officers[] = [
    { 
      name: 'Toby Nguyen', title: 'President', email: 'tan942@utexas.edu',
      profileLink: '', picture: TobyNguyenPic },
    {
      name: 'Zaara Bilal', title: 'Vice President', email: 'zbilal@utexas.edu',
      profileLink: '', picture: ZaaraBilalPic },
    { 
      name: 'Morris Lin', title: 'Secretary', email: 'morrislinyuan@utexas.edu',
      profileLink: '', picture: RasLogoBigPic },
    {
      name: 'Andrew Senyszyn', title: 'Treasurer', email: 'Andrewsenyszyn@utexas.edu',
      profileLink: '', picture: RasLogoBigPic },
    {
      name: 'Colin Tan', title: 'Treasurer', email: 'colinyqt@utexas.edu',
      profileLink: '', picture: ColinTanPic },
    {
      name: 'Allen (Haici) Ai', title: 'Fundraising Coordinator', email: 'haicil@utexas.edu',
      profileLink: '', picture: RasLogoBigPic },
    {
      name: 'Linh Tran', title: 'Corporate Relations', email: 'linh.tran@utexas.edu',
      profileLink: '', picture: RasLogoBigPic },
    {
      name: 'Evan Lai', title: 'Corporate Relations', email: 'exl79@my.utexas.edu',
      profileLink: '', picture: EvanPic },
    {
      name: 'Barrett Lubianski', title: 'Outreach Coordinator', email: 'barrettlubianski@utexas.edu',
      profileLink: '', picture:  RasLogoBigPic},
    {
      name: 'Gustavo Villalobos', title: 'Special Events Coordinator', email: 'gvp05@utexas.edu',
      profileLink: '', picture: GustavoVillalobosPic },
    {
      name: 'Annie Vu', title: 'Publicity Coordinator', email: 'Annie.2005@utexas.edu',
      profileLink: '', picture: AnnieVuPic },
    {
      name: 'Karmanyaah Malhotra', title: 'Publicity Coordinator', email: 'karmalhotra@utexas.edu',
      profileLink: '', picture: KarmanyaahMalhotraPic },
    {
      name: 'Zaid Albustami', title: 'Webmaster', email: 'zaida@utexas.edu',
      profileLink: '', picture: RasLogoBigPic },
];

export const teamleads: officers[] = [
    {
      name: 'Dhruv Bansal', title: 'Demobots Committee Head', email: 'dhruvbansal@utexas.edu',
      profileLink: '', discord: '', picture: DhruvBansalPic },
    {
      name: 'Tyler Hom', title: 'Robomaster Committee Head', email: 'tylerjhom@utexas.edu',
      profileLink: '', discord: 'thehominator', picture: TylerHomPic },
    {
      name: 'Suhas Voolla', title: 'Robomaster Committee Head', email: 'suhasv@utexas.edu',
      profileLink: '', discord: '', picture: TylerHomPic },
    {
    //   name: 'Jeffrey Chang', title: 'Robotathon Committee Head', email: '',
    //   profileLink: '', discord: 'ohoftoryoy', picture: JeffreyChangPic },
    // {
      name: 'Hasif Shaikh', title: 'VexU Committee Head', email: 'hasifshaikh@utexas.edu',
      profileLink: '', discord: 'has02', picture: HasifShaikhPic },
    {
      name: 'Natalie Best', title: 'VexU Committee Head', email: 'nbest776@utexas.edu',
      profileLink: '', discord: '', picture: RasLogoBigPic },
    // {
    //   name: 'Toby Nguyen', title: 'Fundraising', email: 'tan942@utexas.edu',
    //   profileLink: '', discord: 'tguyen', picture: TobyNguyenPic },
    // {
    //   name: 'Grace Li', title: 'Corporate', email: 'gracewl@utexas.edu',
    //   profileLink: '', discord: 'watchycat', picture: GraceLiPic },
];

export const leaders: leaders[] = [
    { name: "Yilin Jin", profileLink: 'https://www.linkedin.com/in/yilin-jin-20b986248/', picture: YilinJinPic }, 
    { name: "Jiwoo Park", profileLink: 'https://www.linkedin.com/in/jiwoooop/', picture: JiwooParkPic },
    { name: "Lakshay Gupta", profileLink: 'https://www.linkedin.com/in/lakshay-gupta-168620246/', picture: LakshayGuptaPic },
    { name: "Wenyu Zhu", profileLink: 'https://www.linkedin.com/in/wenyugzhu/', picture: RasLogoBigPic },
    { name: "Will Reger", profileLink: 'https://www.linkedin.com/in/will-reger-6760831a1/', picture: WillRegerPic },
    { name: "Dylan Zu", profileLink: 'https://www.linkedin.com/in/dylan-zu-7807231bb/', picture: DylanZuPic },
    { name: "Olyvia Witham", profileLink: 'https://www.linkedin.com/in/olyvia-witham-74418628b/', picture: RasLogoBigPic },
    
    { name: "Rafael Torres", profileLink: '', picture: RafaelTorresPic },
    { name: "Richard Aguilar", profileLink: '', picture:  RasLogoBigPic},
    { name: "Andrew Kuo", profileLink: '', picture:  RasLogoBigPic},
    { name: "Ashlynn Tusneem", profileLink: '', picture: RasLogoBigPic },
    { name: "Bhavana Katta", profileLink: '', picture:  RasLogoBigPic},
    { name: "Brianna Dickson", profileLink: '', picture: RasLogoBigPic },
    { name: "Carolyn Hoang", profileLink: '', picture: CarolynHoangPic },
    { name: "Dhruv Nistala", profileLink: '', picture: DhruvNistalaPic },
    { name: "Natalie Best", profileLink: '', picture: RasLogoBigPic },
    { name: "Eric Liu", profileLink: '', picture: RasLogoBigPic },
    { name: "Grace Li", profileLink: '', picture: GraceLiPic },
    { name: "Jake Tomczesyn", profileLink: '', picture: JakeTomczesynPic },
    { name: "Joseph Romero", profileLink: '', picture: RasLogoBigPic },
    { name: "Junhan (Johnny) Shen", profileLink: '', picture: RasLogoBigPic },
    { name: "Richard Bai", profileLink: '', picture: RichardBaiPic },
    { name: "Shreeya Garapaty", profileLink: '', picture: ShreeyaGarapatyPic },
    { name: "Sicheng (Terry) Tan", profileLink: '', picture: RasLogoBigPic },
    { name: "Sricharan Hari", profileLink: '', picture: RasLogoBigPic },
    { name: "Tanya Nikam", profileLink: '', picture: RasLogoBigPic },
    { name: "Theodore Hubbard", profileLink: '', picture: RasLogoBigPic },
];